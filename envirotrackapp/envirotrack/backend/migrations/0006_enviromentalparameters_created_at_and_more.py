# Generated by Django 4.2.4 on 2023-09-03 14:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('backend', '0005_enviromentalparameters_measurement_instrument'),
    ]

    operations = [
        migrations.AddField(
            model_name='enviromentalparameters',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='enviromentalparameters',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_parameters', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='enviromentalparameters',
            name='modified_at',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        migrations.AddField(
            model_name='enviromentalparameters',
            name='modified_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='modified_parameters', to=settings.AUTH_USER_MODEL),
        ),
    ]
