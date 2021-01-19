from rest_framework import permissions


class IsUser(permissions.BasePermission):

    def has_permission(self, request, view):

        print('has_permission')

        print(request.user)
        print(request.user.is_authenticated)

        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):

        print('has_object_permission')

        print(obj.id)
        print(request.user.id)
        
        return obj.id == request.user.id


class IsOwner(permissions.BasePermission):

    def has_permission(self, request, view):

        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        
        return obj.owner == request.user


class ImagePermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        
        return request.user == obj.owner or not obj.private
