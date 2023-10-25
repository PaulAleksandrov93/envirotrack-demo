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
  const [parameterSets, setParameterSets] = useState([
    {
      temperature_celsius: '',
      humidity_percentage: '',
      pressure_kpa: '',
      pressure_mmhg: '',
      date_time: '',
    }
  ]);
  const [parameter, setParameter] = useState({
    date_time: '',
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/current_user/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + String(authTokens.access),
          },
        });
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
    try {
      let response = await fetch(`/api/parameters/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + String(authTokens.access),
        },
      });
      let data = await response.json();
      setParameter(data);
      setSelectedRoom(data.room);
      setCreatedBy(data.created_by);
      setModifiedBy(data.modified_by);

      // Убеждаемся, что параметрсеты существуют и являются массивом
      if (Array.isArray(data.parameter_sets)) {
        setParameterSets(data.parameter_sets);
      } else {
        console.error('Ошибка: parameter_sets не является массивом', data);
      }
    } catch (error) {
      console.error('Error fetching parameter:', error);
    }
  }, [authTokens.access, id]);

  const getRooms = useCallback(async () => {
    try {
      let response = await fetch(`/api/rooms/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + String(authTokens.access),
        },
      });
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
  

  // Функция для получения параметрсетов записи
  // const getParameterSets = useCallback(async () => {
  //   if (id !== 'new') {
  //     try {
  //       const response = await fetch(`/api/parameters/${id}/`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: 'Bearer ' + String(authTokens.access),
  //         },
  //       });
  //       const data = await response.json();
  
  //       if (data.parameter_sets) {
  //         setParameterSets(data.parameter_sets);
  //       } else {
  //         console.error('Ошибка: data не содержит parameter_sets', data);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching parameter sets:', error);
  //     }
  //   }
  // }, [authTokens.access, id]);
  
  useEffect(() => {
    // getParameterSets();
    getParameter();
    getRooms();
    getMeasurementInstruments();
  }, [getParameter, getRooms, getMeasurementInstruments]);

  const addParameterSet = () => {
    if (currentUser) {
      setParameterSets([...parameterSets, { 
        temperature_celsius: '',
        humidity_percentage: '',
        pressure_kpa: '',
        pressure_mmhg: '',
        date_time: '',
      }]);
    } else {
      console.error('User not authenticated');
    }
  };

  const updateParameterSet = (index, newSet) => {
    setParameterSets(prevSets => {
      return prevSets.map((set, i) => {
        if (i === index) {
          return newSet;
        } else {
          return set;
        }
      });
    });
  };
  const deleteLastParameterSet = () => {
    if (currentUser) {
      if (parameterSets.length > 1) {
        const newParameterSets = parameterSets.slice(0, -1);
        setParameterSets(newParameterSets);
      }
    } else {
      console.error('User not authenticated');
    }
  };

  const handleParameterSetChange = (index, key, value) => {
    setParameterSets(prevSets => {
      const updatedSets = [...prevSets];
      updatedSets[index] = { ...updatedSets[index], [key]: parseFloat(value) || '' }; 
      return updatedSets;
    });

    // Вызывает функцию updateParameterSet с передачей индекса и обновленного набора параметров
    updateParameterSet(index, {
      ...parameterSets[index],
      [key]: parseFloat(value) || '',
    });
  };

  const renderParameterSets = () => {
    return parameterSets.map((parameterSet, index) => (
      <div key={index} className='parameter-set'>
        <div className='left-column'>
          <div className='parameter-field'>
            <label htmlFor='temperature_celsius'>Температура, °C:</label>
            <input
              type='number'
              value={parameterSet.temperature_celsius}
              onChange={(e) => handleParameterSetChange(index, 'temperature_celsius', e.target.value)}
            />
          </div>
          <div className='parameter-field'>
            <label htmlFor='humidity_percentage'>Влажность, %:</label>
            <input
              type='number'
              value={parameterSet.humidity_percentage}
              onChange={(e) => handleParameterSetChange(index, 'humidity_percentage', e.target.value)}
            />
          </div>
          <div className='parameter-field'>
            <label htmlFor='pressure_kpa'>Давление, кПа:</label>
            <input
              type='number'
              value={parameterSet.pressure_kpa}
              onChange={(e) => handleParameterSetChange(index, 'pressure_kpa', e.target.value)}
            />
          </div>
          <div className='parameter-field'>
            <label htmlFor='pressure_mmhg'>Давление, ммРС:</label>
            <input
              type='number'
              value={parameterSet.pressure_mmhg}
              onChange={(e) => handleParameterSetChange(index, 'pressure_mmhg', e.target.value)}
            />
          </div>
          <div className='parameter-field'>
            <label htmlFor='time'>Время:</label>
            <input
              type='time'
              value={parameterSet.time ? parameterSet.time : ''}
              onChange={(e) => handleParameterSetChange(index, 'time', e.target.value)}
            />
          </div>
        </div>
      </div>
    ));
  };


  const createParameters = async () => {
    if (currentUser) {
      const newParameterSets = parameterSets.map(set => ({
        temperature_celsius: parseFloat(set.temperature_celsius),
        humidity_percentage: parseFloat(set.humidity_percentage),
        pressure_kpa: parseFloat(set.pressure_kpa),
        pressure_mmhg: parseFloat(set.pressure_mmhg),
        date_time: set.date_time,
      }));

      try {
        const responseSet = await fetch('/api/parameter_sets/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + String(authTokens.access),
          },
          body: JSON.stringify(newParameterSets),
        });

        if (responseSet.ok) {
          console.log('Созданы наборы параметров');

          const responseData = await responseSet.json();
          const newParameters = responseData.map(id => ({
            room: { room_number: selectedRoom.room_number },
            measurement_instrument: {
              name: parameter.measurement_instrument.name,
              type: parameter.measurement_instrument.type,
              serial_number: parameter.measurement_instrument.serial_number,
              calibration_date: parameter.measurement_instrument.calibration_date,
              calibration_interval: parameter.measurement_instrument.calibration_interval,
            },
            date_time: parameter.date_time,
            responsible: {
              id: currentUser.id,
              first_name: currentUser.first_name,
              last_name: currentUser.last_name,
              patronymic: currentUser.patronymic,
            },
            parameter_set: id,
          }));

          const responseParameters = await fetch('/api/parameters/create/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + String(authTokens.access),
            },
            body: JSON.stringify(newParameters),
          });

          if (responseParameters.ok) {
            console.log('Созданы параметры');
            navigate('/');
          } else {
            console.error('Failed to create parameters:', responseParameters.statusText);
          }
        } else {
          console.error('Failed to create parameter sets:', responseSet.statusText);
        }
      } catch (error) {
        console.error('Error while creating parameter sets and parameters:', error);
      }
    }
  };

  const updateParameter = async () => {
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
  
        // Обновление параметр сетов
        for (let i = 0; i < parameterSets.length; i++) {
          await updateParameterSet(i, parameterSets[i]);
        }
      } else {
        console.error('Failed to update parameter:', response.statusText);
      }
    } catch (error) {
      console.error('Error while updating parameter:', error);
    }
  };

  const deleteParameter = async () => {
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

  const handleSubmit = () => {
    navigate('/');
  };

  const handleChange = (field, value) => {
    if (field === 'pressure_kpa') {
      const kpaValue = parseFloat(value);
      if (!isNaN(kpaValue)) {
        const mmHgValue = Math.round(kpaValue * 7.50062 * 100) / 100;
        setParameter((prevParameter) => ({
          ...prevParameter,
          pressure_kpa: Math.round(kpaValue * 100) / 100,
          pressure_mmhg: mmHgValue,
        }));
      }
    } else if (field === 'pressure_mmhg') {
      const mmHgValue = parseFloat(value);
      if (!isNaN(mmHgValue)) {
        const kpaValue = Math.round((mmHgValue / 7.50062) * 100) / 100;
        setParameter((prevParameter) => ({
          ...prevParameter,
          pressure_kpa: kpaValue,
          pressure_mmhg: mmHgValue,
        }));
      }
    } else {
      setParameter((prevParameter) => ({ ...prevParameter, [field]: value }));
    }
  };
  const handleSave = async () => {
    if (id === 'new') {
      createParameters();
    } else {
      await updateParameter();
    }
  };

  return (
    <div className='parameter'>
            <div className='parameter-header'>
        {id !== 'new' ? (
          <>
            <button className="parameter-button-delete" onClick={deleteParameter}>Удалить</button>
            <button className="parameter-button-save" onClick={handleSave}>Сохранить</button>
            <button className="parameter-button-create" onClick={addParameterSet}>Добавить набор параметров</button>
            <button className="parameter-button-create" onClick={deleteLastParameterSet} disabled={parameterSets.length === 1}>
              Удалить набор параметров
            </button>
            <button className="parameter-button-back" onClick={handleSubmit}>Назад</button>
          </>
        ) : (
          <>
            <button className="parameter-button-create" onClick={handleSave}>Создать запись</button>
            <button className="parameter-button-create" onClick={addParameterSet}>Добавить набор параметров</button>
            <button className="parameter-button-create" onClick={deleteLastParameterSet} disabled={parameterSets.length === 1}>
              Удалить набор параметров
            </button>
            <button className="parameter-button-back" onClick={handleSubmit}>Назад</button>
          </>
        )}
      </div>
      <div className='parameter-fields'>
        {renderParameterSets()}
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
              value={parameter && parameter.measurement_instrument ? { 
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
              value={parameter.date_time ? parameter.date_time.slice(0, -1) : ''}
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