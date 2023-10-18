from rest_framework import serializers
from backend.models import Responsible, Room, EnviromentalParameters, MeasurementInstrument, ParameterSet


class ResponsibleSerializer(serializers.ModelSerializer):
    profession = serializers.StringRelatedField()

    class Meta:
        model = Responsible
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class RoomNumberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['room_number']


class RoomSelectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'room_number']


class ResposibleNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Responsible
        fields = ['first_name', 'last_name']


class MeasurementInstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementInstrument
        fields = ['id', 'name', 'type', 'serial_number', 'calibration_date', 'calibration_interval']

class ParameterSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParameterSet
        fields = ['temperature_celsius', 'humidity_percentage', 'pressure_kpa', 'pressure_mmhg', 'date_time']
class EnvironmentalParametersSerializer(serializers.ModelSerializer):
    room = RoomSelectSerializer()
    responsible = ResponsibleSerializer()
    measurement_instrument = MeasurementInstrumentSerializer()
    created_by = serializers.StringRelatedField()  
    modified_by = serializers.StringRelatedField()  
    parameter_set = ParameterSetSerializer()  

    class Meta:
        model = EnviromentalParameters
        fields = ['id', 'room', 'responsible', 'measurement_instrument', 'created_by', 'modified_by', 
                  'created_at', 'modified_at', 'parameter_set']
        
    def update(self, instance, validated_data):
        room_data = validated_data.pop('room', None)
        responsible_data = validated_data.pop('responsible', None)
        measurement_instrument_data = validated_data.pop('measurement_instrument', None)

        if room_data:
            room, created = Room.objects.get_or_create(room_number=room_data.get('room_number'))
            instance.room = room

        if responsible_data:
            responsible, created = Responsible.objects.get_or_create(
                first_name=responsible_data.get('first_name'),
                last_name=responsible_data.get('last_name')
            )
            instance.responsible = responsible

        if measurement_instrument_data:
            measurement_instrument, created = MeasurementInstrument.objects.get_or_create(
                name=measurement_instrument_data.get('name'),
                type=measurement_instrument_data.get('type'),
                serial_number=measurement_instrument_data.get('serial_number'),
                calibration_date=measurement_instrument_data.get('calibration_date'),
                calibration_interval=measurement_instrument_data.get('calibration_interval')
            )
            instance.measurement_instrument = measurement_instrument

        # Добавляем обновление информации о пользователе, изменившем запись
        if self.context['request'].user.is_authenticated:
            instance.modified_by = self.context['request'].user

        instance.temperature_celsius = validated_data.get('temperature_celsius', instance.temperature_celsius)
        instance.humidity_percentage = validated_data.get('humidity_percentage', instance.humidity_percentage)
        instance.pressure_kpa = validated_data.get('pressure_kpa', instance.pressure_kpa)
        instance.pressure_mmhg = validated_data.get('pressure_mmhg', instance.pressure_mmhg)
        instance.date_time = validated_data.get('date_time', instance.date_time)
        instance.save()

        return instance

    def create(self, validated_data):
        room_data = validated_data.pop('room', None)
        responsible_data = validated_data.pop('responsible', None)
        measurement_instrument_data = validated_data.pop('measurement_instrument', None)

        room = None
        if room_data:
            room, created = Room.objects.get_or_create(room_number=room_data.room_number)

        responsible = None
        if responsible_data:
            responsible, created = Responsible.objects.get_or_create(
                first_name=responsible_data.first_name,
                last_name=responsible_data.last_name
            )

        measurement_instrument = None
        if measurement_instrument_data:
            measurement_instrument, created = MeasurementInstrument.objects.get_or_create(
                **measurement_instrument_data
            )

        # Добавляем информацию о пользователе, создавшем запись
        if self.context['request'].user.is_authenticated:
            validated_data['created_by'] = self.context['request'].user

        instance = EnviromentalParameters.objects.create(
            room=room,
            responsible=responsible,
            measurement_instrument=measurement_instrument,
            **validated_data
        )
        return instance
    
class FilterParametersSerializer(serializers.Serializer):
    responsible = serializers.IntegerField(required=False)
    room = serializers.IntegerField(required=False)
    date = serializers.DateField(required=False)