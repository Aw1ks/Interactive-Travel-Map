from django.db import models

class Country(models.Model):
    name = models.CharField(
        'Название страны', 
        max_length=100, 
        blank=False, 
        null=False
    )

    latitude = models.FloatField('Широта', blank=False, null=False)
    longitude = models.FloatField('Долгота', blank=False, null=False)

    description = models.TextField('Описание страны')

    capital = models.CharField('Столица', max_length=100)
    president = models.CharField('Президент', max_length=100)
    population = models.PositiveIntegerField('Население')

    image = models.ImageField('Фотография страны', upload_to='country_photo/')

    def __str__(self):
        return self.name


class Post(models.Model):
    image = models.ImageField(
        'Фото в посте', 
        upload_to='user_photos/', 
        blank=False, 
        null=False
    )
    description = models.TextField('Текст поста', blank=False, null=False)

    latitude = models.FloatField('Широта', blank=False, null=False)
    longitude = models.FloatField('Долгота', blank=False, null=False)

    created_at = models.DateTimeField('Время создания поста', auto_now_add=True)

    def __str__(self):
        return f"{self.country.name} ({self.latitude}, {self.longitude})"


class Comment(models.Model):
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    text = models.TextField('Текст коментария', blank=False, null=False)
    created_at = models.DateTimeField('Время создания коментария', auto_now_add=True, )

    def __str__(self):
        return f"Comment by {self.author} on {self.post.country.name}"
