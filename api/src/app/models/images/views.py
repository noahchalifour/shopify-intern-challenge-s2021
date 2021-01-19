from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from rest_framework_bulk import BulkModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse
import os

from ...permissions import IsOwner, ImagePermission
from .image import Image
from .serializer import ImageSerializer
from ...utils import image_search


class ImageViewSet(BulkModelViewSet):

    serializer_class = ImageSerializer
    permission_classes = [IsOwner]
    queryset = Image.objects.order_by('-uploaded_at')
    filterset_fields = ('owner', )

    permission_classes_by_action = {
        'list': [AllowAny],
        'retrieve': [ImagePermission],
        'image': [ImagePermission],
        'create': [IsAuthenticated]
    }

    def get_queryset(self):

        queryset = None

        if self.action in ['list', 'search']:
            if self.request.user and self.request.user.is_authenticated:
                queryset = Image.objects.filter(Q(private=False) | Q(owner=self.request.user))
            else:
                queryset = Image.objects.filter(private=False)

        if queryset is None:
            queryset = Image.objects

        return queryset.order_by('-uploaded_at')

    def get_permissions(self):

        try:
            return [permission() for permission in 
                    self.permission_classes_by_action[self.action]]
        except KeyError: 
            return [permission() for permission in 
                    self.permission_classes]

    def perform_create(self, serializer):

        upload = serializer.validated_data['upload']
        title = os.path.splitext(upload.name)[0]

        image_search.add_image(upload)

        return serializer.save(
            title=title,
            owner=self.request.user)

    def perform_update(self, serializer):

        return serializer.save(
            owner=self.request.user)

    def perform_destroy(self, instance):

        Image.objects.filter(id__gt=instance.id).update(
            vector_idx=F('vector_idx') - 1)

        image_search.remove_image(instance)

        return super().perform_destroy(instance)

    @action(detail=True, methods=['GET'], name='Get Image')
    def image(self, request, pk=None):

        img_obj = get_object_or_404(Image, pk=pk)
        self.check_object_permissions(request, img_obj)

        img_file = img_obj.upload
        file_handle = img_file.open()

        return FileResponse(file_handle)

    @action(detail=False, methods=['POST'], name='Search Images')
    def search(self, request):

        body = request.data

        queryset = self.get_queryset()

        if body['search_type'] == 'keywords':

            for kw in body['value'].split(','):
                queryset = queryset.filter(keywords__contains=kw.strip())

        elif body['search_type'] == 'caption':

            pass

        elif body['search_type'] == 'image':

            images = image_search.search_by_image(body['image'])

            if len(images) == 0:
                queryset = Image.objects.none()
            else:
                or_q = None
                for vector_idx in images:
                    if or_q is None:
                        or_q = Q(vector_idx=vector_idx)
                    else:
                        or_q = or_q | Q(vector_idx=vector_idx)
                if or_q is not None:
                    queryset = queryset.filter(or_q)
                sorted_qs = []
                for idx in images:
                    try:
                        sorted_qs.append(queryset.get(vector_idx=idx))
                    except:
                        pass
                queryset = sorted_qs
                
        # queryset = self.paginator.paginate_queryset(queryset, request)
        s = self.serializer_class(queryset, many=True)

        # return self.paginator.get_paginated_response(s.data)
        return Response({
            'next': None,
            'previous': None,
            'count': -1,
            'results': s.data
        })