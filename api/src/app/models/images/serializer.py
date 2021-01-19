from rest_framework import serializers
from rest_framework_bulk import (
    BulkListSerializer,
    BulkSerializerMixin
)

from .image import Image


class ImageSerializer(BulkSerializerMixin,
                      serializers.ModelSerializer):

    title = serializers.CharField(read_only=True)
    owner = serializers.ReadOnlyField(source='owner.id')
    upload = serializers.ImageField(write_only=True)

    class Meta:

        model = Image
        list_serializer_class = BulkListSerializer
        fields = [
            'id',
            'title',
            'upload',
            'owner',
            'keywords',
            'private',
            'uploaded_at'
        ]