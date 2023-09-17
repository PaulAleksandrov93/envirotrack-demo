from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from backend.models import Responsible, Room, EnviromentalParameters, MeasurementInstrument
from .serializers import EnvironmentalParametersSerializer, RoomSelectSerializer, ResponsibleSerializer, MeasurementInstrumentSerializer


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
    routes = [
        '/api/token',
        '/api/token/refresh',
    ]
    return Response(routes)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def getEnviromentalParameters(request):
#     user = request.user
#     parameters = EnviromentalParameters.objects.all()
#     serializer = EnvironmentalParametersSerializer(parameters, many=True, context={'request': request})
#     return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getEnviromentalParameters(request):
    user = request.user
    parameters = EnviromentalParameters.objects.all().prefetch_related('room', 'responsible', 'measurement_instrument')
    serializer = EnvironmentalParametersSerializer(parameters, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getEnviromentalParameter(request, pk):
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
    try:
        environmental_params = EnviromentalParameters.objects.get(pk=pk)
    except EnviromentalParameters.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    environmental_params.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def filterEnvironmentalParameters(request):
    responsible_id = request.query_params.get('responsible')
    room_id = request.query_params.get('room')
    date = request.query_params.get('date')

    print(f'responsible_id: {responsible_id}, room_id: {room_id}, date: {date}')

    filters = Q()

    if responsible_id:
        filters &= Q(responsible=responsible_id)
    if room_id:
        filters &= Q(room=room_id)
    if date:
        filters &= Q(date_time__date=date)

    parameters = EnvironmentalParameters.objects.filter(filters)

    serializer = EnvironmentalParametersSerializer(parameters, many=True)
    return Response(serializer.data)