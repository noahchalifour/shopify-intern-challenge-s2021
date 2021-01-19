from django.db import models
from django.contrib.auth.models import User


class Image(models.Model):

    upload = models.ImageField(upload_to='uploads', null=False)
    title = models.CharField(max_length=64, null=False)
    keywords = models.CharField(max_length=256, default='')
    private = models.BooleanField(default=False)
    vector_idx = models.IntegerField(default=0)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        images_idx = Image.objects.order_by('-vector_idx')
        
        if images_idx.count() > 0:
            self.vector_idx = images_idx[0].vector_idx + 1

        super().save(*args, **kwargs)