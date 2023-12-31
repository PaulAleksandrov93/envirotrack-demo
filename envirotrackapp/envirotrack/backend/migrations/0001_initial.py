# Generated by Django 4.1.7 on 2023-10-22 17:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='MeasurementInstrument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Название')),
                ('type', models.CharField(max_length=255, verbose_name='Тип')),
                ('serial_number', models.CharField(max_length=50, verbose_name='Заводской номер')),
                ('calibration_date', models.DateField(verbose_name='Дата поверки')),
                ('calibration_interval', models.PositiveIntegerField(verbose_name='Межповерочный интервал')),
            ],
            options={
                'verbose_name': 'Средство измерения',
                'verbose_name_plural': 'Средства измерения',
            },
        ),
        migrations.CreateModel(
            name='ParameterSet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('temperature_celsius', models.DecimalField(decimal_places=2, max_digits=5)),
                ('humidity_percentage', models.DecimalField(decimal_places=2, max_digits=5)),
                ('pressure_kpa', models.DecimalField(decimal_places=2, max_digits=7)),
                ('pressure_mmhg', models.DecimalField(decimal_places=2, max_digits=7)),
                ('time', models.TimeField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Набор параметров',
                'verbose_name_plural': 'Наборы параметров',
            },
        ),
        migrations.CreateModel(
            name='Profession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Название')),
            ],
            options={
                'verbose_name': 'Профессия',
                'verbose_name_plural': 'Профессии',
            },
        ),
        migrations.CreateModel(
            name='Responsible',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_name', models.CharField(max_length=50, verbose_name='Фамилия')),
                ('first_name', models.CharField(max_length=50, verbose_name='Имя')),
                ('patronymic', models.CharField(max_length=50, verbose_name='Отчество')),
                ('profession', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='backend.profession', verbose_name='Профессия')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Ответственный',
                'verbose_name_plural': 'Ответственные',
            },
        ),
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('room_number', models.CharField(max_length=10, verbose_name='Номер помещения')),
                ('responsible_persons', models.ManyToManyField(related_name='rooms', to='backend.responsible', verbose_name='Ответственный')),
            ],
            options={
                'verbose_name': 'Помещение',
                'verbose_name_plural': 'Помещения',
            },
        ),
        migrations.CreateModel(
            name='EnviromentalParameters',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified_at', models.DateTimeField(auto_now=True, null=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_parameters', to=settings.AUTH_USER_MODEL)),
                ('measurement_instrument', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='backend.measurementinstrument')),
                ('modified_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='modified_parameters', to=settings.AUTH_USER_MODEL)),
                ('parameter_sets', models.ManyToManyField(blank=True, related_name='environmental_parameters', to='backend.parameterset')),
                ('responsible', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='environmental_parameters', to='backend.responsible')),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend.room')),
            ],
            options={
                'verbose_name': 'Параметры окружающей среды',
                'verbose_name_plural': 'Параметры окружающей среды',
            },
        ),
    ]
