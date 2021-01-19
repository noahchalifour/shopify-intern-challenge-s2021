from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework.response import Response

from ...permissions import IsUser
from .serializer import UserSerializer


class UserViewSet(mixins.CreateModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.DestroyModelMixin,
                  mixins.RetrieveModelMixin,
                  viewsets.GenericViewSet):

    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [IsUser]

    permission_classes_by_action = {
        'create': [AllowAny]
    }

    def get_permissions(self):

        try:
            return [permission() for permission in 
                    self.permission_classes_by_action[self.action]]
        except KeyError: 
            return [permission() for permission in 
                    self.permission_classes]

    @action(detail=False, methods=['GET'], name='Get Me')
    def me(self, request):

        s = self.serializer_class(request.user)

        return Response(s.data)