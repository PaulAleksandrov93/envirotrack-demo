import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Select from 'react-select';
import './ParametersPage.css';

const ParameterPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [measurementInstruments, setMeasurementInstruments] = useState([]);
  const { authTokens } = useContext(AuthContext);
  const [createdBy, setCreatedBy] = useState(null);
  const [modifiedBy, setModifiedBy] = useState(null);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch(
          '/api/current_user/',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + String(authTokens.access),
            },
          }
        );
        const data = await response.json();
        setCurrentUser(data); 
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    getCurrentUser();
  }, [authTokens.access]);

  const getParameter = useCallback(async () => {
    if (id === 'new') return;
    let response = await fetch(
      `/api/parameters/${id}/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + String(authTokens.access),
        },
      }
    );
    let data = await response.json();
    setParameter(data);
    setSelectedRoom(data.room);
    setCreatedBy(data.created_by);
    setModifiedBy(data.modified_by);
  }, [authTokens.access, id]);

  let [parameter, setParameter] = useState(null);

  const getRooms = useCallback(async () => {
    try {
      let response = await fetch(`/api/rooms/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + String(authTokens.access),
        },
      }
    );
      let data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  }, [authTokens.access]);

  const getMeasurementInstruments = useCallback(async () => {
    try {
      const response = await fetch('/api/measurement_instruments/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + String(authTokens.access),
        },
      });
      const data = await response.json();
      setMeasurementInstruments(data);
    } catch (error) {
      console.error('Error fetching measurement instruments:', error);
    }
  }, [authTokens.access]);

  useEffect(() => {
    getParameter();
    getRooms();
    getMeasurementInstruments();
  }, [getParameter, getRooms, getMeasurementInstruments]);

    let createParameter = async () => {
    if (currentUser) {
      const newParameter = {
        room: { room_number: selectedRoom.room_number },
        measurement_instrument: { // Обновляем поле measurement_instrument
          name: parameter.measurement_instrument.name,
          type: parameter.measurement_instrument.type,
          serial_number: parameter.measurement_instrument.serial_number,
          calibration_date: parameter.measurement_instrument.calibration_date,
          calibration_interval: parameter.measurement_instrument.calibration_interval,
        },
        temperature_celsius: parameter.temperature_celsius,
        humidity_percentage: parameter.humidity_percentage,
        pressure_kpa: parameter.pressure_kpa,
        pressure_mmhg: parameter.pressure_mmhg,
        date_time: parameter.date_time,
        responsible: {
          id: currentUser.id,
          first_name: currentUser.first_name,
          last_name: currentUser.last_name,
          patronymic: currentUser.patronymic,
        },
      };
      try {
        const response = await fetch('/api/parameters/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + String(authTokens.access),
          },
          body: JSON.stringify(newParameter),
        });
  
        if (response.ok) {
          console.log('Создана запись')
          
          navigate('/');
        } else {
          console.error('Failed to create parameter:', response.statusText);
        }
      } catch (error) {
        console.error('Error while creating parameter:', error);
      }
    }
  };

  let updateParameter = async () => {
    try {
      const response = await fetch(`/api/parameters/update/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + String(authTokens.access),
        },
        body: JSON.stringify(parameter),
      });

      if (response.ok) {
        console.log('Запись успешно обновлена');
        // Перенаправление на список параметров
        navigate('/'); 
      } else {
        console.error('Failed to update parameter:', response.statusText);
      }
    } catch (error) {
      console.error('Error while updating parameter:', error);
    }
  };

  let deleteParameter = async () => {
    if (parameter !== null) {
      try {
        const response = await fetch(`/api/parameters/delete/${id}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + String(authTokens.access),
          },
          body: JSON.stringify(parameter),
        });
  
        if (!response.ok) {
          console.error('Failed to delete parameter:', response.statusText);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error while deleting parameter:', error);
      }
    }
  };

  let handleSubmit = async () => {
    navigate('/');
  };

  let handleChange = (field, value) => {
    if (field === 'pressure_kpa') {
      const kpaValue = parseFloat(value);
      const mmHgValue = Math.round(kpaValue * 7.50062 * 100) / 100; 
      setParameter((prevParameter) => ({
        ...prevParameter,
        pressure_kpa: Math.round(kpaValue * 100) / 100, 
        pressure_mmhg: mmHgValue,
      }));
    } else if (field === 'pressure_mmhg') {
      const mmHgValue = parseFloat(value);
      const kpaValue = Math.round((mmHgValue / 7.50062) * 100) / 100; 
      setParameter((prevParameter) => ({
        ...prevParameter,
        pressure_kpa: kpaValue,
        pressure_mmhg: Math.round(mmHgValue * 100) / 100, 
      }));
    } else {
      setParameter((prevParameter) => ({ ...prevParameter, [field]: value }));
    }
  };

  return (
    <div className='parameter'>
      <div className='parameter-header'>
        {id !== 'new' ? (
          <>
            <button className="parameter-button-delete" onClick={deleteParameter}>Удалить</button>
            <button className="parameter-button-save" onClick={updateParameter}>Сохранить</button>
          </>
        ) : (
          <button className="parameter-button-create" onClick={createParameter}>Создать</button>
        )}
        <button className="parameter-button-back" onClick={handleSubmit}>Назад</button>
      </div>
      <div className='parameter-fields'>
        <div className='left-column'>
          <div className='parameter-field'>
            <label htmlFor='temperature_celsius'>Температура, °C:</label>
            <input
              type='number'
              id='temperature_celsius'
              value={parameter?.temperature_celsius || ''}
              onChange={(e) => handleChange('temperature_celsius', e.target.value)}
            />
          </div>
          <div className='parameter-field'>
            <label htmlFor='humidity_percentage'>Влажность, %:</label>
            <input
              type='number'
              id='humidity'
              value={parameter?.humidity_percentage || ''}
              onChange={(e) => handleChange('humidity_percentage', e.target.value)}
            />
          </div>
          <div className='parameter-field'>
            <label htmlFor='pressure_kpa'>Давление, кПа:</label>
            <input
              type='number'
              id='pressure_kpa'
              value={parameter?.pressure_kpa || ''}
              onChange={(e) => handleChange('pressure_kpa', e.target.value)}
            />
          </div>
          <div className='parameter-field'>
            <label htmlFor='pressure_mmhg'>Давление, ммРС:</label>
            <input
              type='number'
              id='pressure_mmhg'
              value={parameter?.pressure_mmhg || ''}
              onChange={(e) => handleChange('pressure_mmhg', e.target.value)}
            />
          </div>
        </div>
        <div className='right-column'>
        <div className='parameter-field'>
            <label htmlFor='measurement_instrument'>Средство измерения:</label>
            <Select
              className="custom-select"
              options={measurementInstruments.map((instrument) => ({
                value: instrument.id,
                label: instrument.name,
                type: instrument.type,
                serial_number: instrument.serial_number,
                calibration_date: instrument.calibration_date,
                calibration_interval: instrument.calibration_interval,
              }))}
              value={parameter && parameter.measurement_instrument ? { // Добавлена проверка на существование parameter.measurement_instrument
                value: parameter.measurement_instrument.id,
                label: parameter.measurement_instrument.name,
                type: parameter.measurement_instrument.type,
                serial_number: parameter.measurement_instrument.serial_number,
                calibration_date: parameter.measurement_instrument.calibration_date,
                calibration_interval: parameter.measurement_instrument.calibration_interval,
              } : null}
              onChange={(selectedOption) =>
                setParameter((prevParameter) => ({
                  ...prevParameter,
                  measurement_instrument: {
                    id: selectedOption.value,
                    name: selectedOption.label,
                    type: selectedOption.type,
                    serial_number: selectedOption.serial_number,
                    calibration_date: selectedOption.calibration_date,
                    calibration_interval: selectedOption.calibration_interval,
                  },
                }))
              }
            />
          </div>
          <div className='parameter-field'>
            <label htmlFor='room'>Помещение:</label>
            <Select
              className="custom-select"
              options={rooms ? rooms.map((room) => ({ value: room.id, label: room.room_number })) : []}
              value={selectedRoom ? { value: selectedRoom.id, label: selectedRoom.room_number } : null}
              onChange={(selectedOption) =>
                setSelectedRoom({ id: selectedOption.value, room_number: selectedOption.label })
              }
            />
          </div>
          <div className='parameter-field'>
            <label htmlFor='date_time'>Дата и время:</label>
            <input
              type='datetime-local'
              id='date_time'
              value={parameter?.date_time ? parameter.date_time.slice(0, -1) : ''}
              onChange={(e) => handleChange('date_time', e.target.value + 'Z')}
            />
          </div>
          <div className='parameter-fields-1'>
            <div className='parameter-field'>
              <label>Создано:</label>
              <div className="created-by">{createdBy ? `${createdBy}` : 'Нет данных'}</div>
            </div>
            <div className='parameter-field'>
              <label>Изменено:</label>
              <div className="modified-by">{modifiedBy ? `${modifiedBy}` : 'Нет данных'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterPage;