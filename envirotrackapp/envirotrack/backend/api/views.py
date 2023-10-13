"""
Функции представлений для управления параметрами окружающей среды, комнатами,
ответственными лицами, измерительными приборами и аутентификацией пользователей.
"""


from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from datetime import datetime, timedelta

from backend.models import Responsible, Room, EnviromentalParameters, MeasurementInstrument, ParameterSet
from .serializers import EnvironmentalParametersSerializer, RoomSelectSerializer, ResponsibleSerializer, MeasurementInstrumentSerializer, FilterParametersSerializer, ParameterSetSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        # ...

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getRoutes(request):
    """
    Возвращает список доступных маршрутов.

    Возвращает:
        Response: JSON-ответ с перечнем доступных маршрутов.
    """
    routes = [
        '/api/token',
        '/api/token/refresh',
    ]
    return Response(routes)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getEnviromentalParameters(request):
    """
    Возвращает все записи с параметрами окружающей среды.

    Args:
        request (Request): Объект HTTP-запроса.

    Returns:
        Response: JSON-ответ с параметрами окружающей среды.
    """
    user = request.user
    responsible = request.query_params.get('responsible')
    room = request.query_params.get('room')
    date = request.query_params.get('date')
    print(f'date:{date}')
    parameters = EnviromentalParameters.objects.all().prefetch_related('room', 'responsible', 'measurement_instrument')

    if responsible:
        parameters = parameters.filter(responsible=responsible)

    if room:
        parameters = parameters.filter(room=room)

    if date:
        date = datetime.strptime(date, '%Y-%m-%d').date()
        parameters = parameters.filter(date_time__date=date)

    parameters = parameters.order_by('date_time')  # Добавляем сортировку по полю date_time
    
    serializer = EnvironmentalParametersSerializer(parameters, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getEnviromentalParameter(request, pk):
    """
    Возвращает конкретную запись с параметрами окружающей среды.

    Args:
        request (Request): Объект HTTP-запроса.

    Returns:
        Response: JSON-ответ с параметрами окружающей среды.
    """
    parameters = EnviromentalParameters.objects.get(id=pk)
    serializer = EnvironmentalParametersSerializer(parameters, many=False)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getRooms(request):
    rooms = Room.objects.all()
    serializer = RoomSelectSerializer(rooms, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMeasurementInstruments(request):
    measurement_instruments = MeasurementInstrument.objects.all()
    serializer = MeasurementInstrumentSerializer(measurement_instruments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getResponsibles(request):
    responsibles = Responsible.objects.all()
    serializer = ResponsibleSerializer(responsibles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createEnvironmentalParameters(request):
    """
    Создает новый набор параметров окружающей среды.

    Args:
        request (Request): Объект HTTP-запроса.

    Returns:
        Response: JSON-ответ, указывающий на успешное или неудачное выполнение операции.
    """    
    serializer = EnvironmentalParametersSerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        room_data = request.data.get('room')
        responsible_data = request.data.get('responsible')

        room = None
        if room_data:
            room, created = Room.objects.get_or_create(room_number=room_data.get('room_number'))

        responsible = None
        if responsible_data:
            responsible, created = Responsible.objects.get_or_create(
                first_name=responsible_data.get('first_name'),
                last_name=responsible_data.get('last_name'),
                patronymic=responsible_data.get('patronymic')
            )

        
        if request.user.is_authenticated:
            serializer.save(room=room, responsible=responsible, created_by=request.user)
        else:
            serializer.save(room=room, responsible=responsible)

        print("Data received on the server:", request.data)
        print("Created by:", serializer.instance.created_by)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateEnvironmentalParameters(request, pk):
    """
    Обновляет существующий набор параметров окружающей среды.

    Args:
        request (Request): Объект HTTP-запроса.
        pk (int): Первичный ключ параметров окружающей среды.

    Returns:
        Response: JSON-ответ, указывающий на успешное или неудачное выполнение операции.
    """
    try:
        environmental_params = EnviromentalParameters.objects.select_related('room', 'responsible', 'measurement_instrument').get(pk=pk)
    except EnviromentalParameters.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = EnvironmentalParametersSerializer(instance=environmental_params, data=request.data, context={'request': request})

    if serializer.is_valid():
        if request.user.is_authenticated:
            serializer.save(modified_by=request.user)

        room_data = request.data.get('room')
        responsible_data = request.data.get('responsible')
        measurement_instrument_data = request.data.get('measurement_instrument')

        room, created = Room.objects.get_or_create(room_number=room_data.get('room_number')) if room_data else (None, False)
        responsible, created = Responsible.objects.get_or_create(
            first_name=responsible_data.get('first_name'),
            last_name=responsible_data.get('last_name'),
            patronymic=responsible_data.get('patronymic')
        ) if responsible_data else (None, False)
        measurement_instrument, created = MeasurementInstrument.objects.get_or_create(**measurement_instrument_data) if measurement_instrument_data else (None, False)

        environmental_params.room = room
        environmental_params.responsible = responsible
        environmental_params.measurement_instrument = measurement_instrument

        environmental_params.save()

        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteEnvironmentalParameters(request, pk):
    """
    Удаляет существующий набор параметров окружающей среды.

    Args:
        request (Request): Объект HTTP-запроса.
        pk (int): Первичный ключ параметров окружающей среды.

    Returns:
        Response: JSON-ответ, указывающий на успешное или неудачное выполнение операции.
    """
    try:
        environmental_params = EnviromentalParameters.objects.get(pk=pk)
    except EnviromentalParameters.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    environmental_params.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Получает информацию о текущем аутентифицированном пользователе.

    Args:
        request (Request): Объект HTTP-запроса.

    Returns:
        Response: JSON-ответ, содержащий информацию о текущем пользователе.
    """
    user = request.user
    if user.is_authenticated:
        try:
            responsible = Responsible.objects.get(user=user)
            serializer = ResponsibleSerializer(responsible)
            return Response(serializer.data)
        except Responsible.DoesNotExist:
            return Response({'error': 'Responsible not found'}, status=404)
    else:
        return Response({'error': 'User not authenticated'}, status=401)

# ===

@api_view(['GET'])
def getParameterSets(request):
    parameter_sets = ParameterSet.objects.all()
    serializer = ParameterSetSerializer(parameter_sets, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def getParameterSet(request, pk):
    parameter_set = ParameterSet.objects.get(id=pk)
    serializer = ParameterSetSerializer(parameter_set, many=False)
    return Response(serializer.data)

@api_view(['POST'])
def createParameterSet(request):
    serializer = ParameterSetSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def updateParameterSet(request, pk):
    try:
        parameter_set = ParameterSet.objects.get(pk=pk)
    except ParameterSet.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = ParameterSetSerializer(instance=parameter_set, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def deleteParameterSet(request, pk):
    try:
        parameter_set = ParameterSet.objects.get(pk=pk)
    except ParameterSet.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    parameter_set.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)