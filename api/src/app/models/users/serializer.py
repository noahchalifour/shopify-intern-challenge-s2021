from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:

        model = User
        fields = [
            'id', 
            'first_name', 
            'last_name', 
            'email', 
            'username', 
            'password'
        ]

    def validate_password(self, value: str) -> str:

        """
        Hash value passed by user.

        :param value: password of a user
        :return: a hashed version of the password
        """

        return make_password(value)