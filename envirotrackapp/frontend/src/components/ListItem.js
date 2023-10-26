import React from 'react';
import { Link } from 'react-router-dom';
import './ListItem.css';

const ListItem = ({ parameter }) => {
  const getTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderParameterSets = (parameterSets) => {
    if (!parameterSets || parameterSets.length === 0) return '-';

    return parameterSets.map((paramSet, index) => (
      <div key={index} className="parameter-set">
        <div>Температура (°C): {paramSet.temperature_celsius}</div>
        <div>Влажность (%): {paramSet.humidity_percentage}</div>
        <div>Давление (кПа): {paramSet.pressure_kpa}</div>
        <div>Давление (мм рт. ст.): {paramSet.pressure_mmhg}</div>
        <div>Время создания: {paramSet.time}</div>
      </div>
    ));
  };

  return (
    <Link to={`/parameter/${parameter.id}`}>
      <div className="parameters-list-item">
        <h3>Помещение: {parameter.room.room_number} | Ответственный: {parameter.responsible.first_name} {parameter.responsible.last_name}</h3>
        <div className="parameters">
          {renderParameterSets(parameter.parameter_sets)}
          <div className="parameter-item">
            <span>Дата и время:</span> {getTime(parameter.created_at)}
          </div>
          <div className="parameter-item">
            <span>Средство измерения:</span> {parameter.measurement_instrument ? parameter.measurement_instrument.name : 'Нет информации'}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListItem;