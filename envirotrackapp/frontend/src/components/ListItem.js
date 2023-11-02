// ListItem.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ListItem.css';

const renderParameterSets = (parameterSets) => {
  if (!parameterSets || parameterSets.length === 0) return '-';

  return parameterSets.map((paramSet, index) => (
    <div key={index} className="parameter-set">
      <div className="parameter-item">
        <span>Набор {index + 1}:</span>
        <span> Температура: {paramSet.temperature_celsius},</span>
        <span> Влажность: {paramSet.humidity_percentage},</span>
        <span> Давление (кПа): {paramSet.pressure_kpa},</span>
        <span> Давление (мм рт. ст.): {paramSet.pressure_mmhg},</span>
        <span> Время создания: {paramSet.time}</span>
      </div>
    </div>
  ));
};

const ListItem = ({ parameter }) => {
  const getTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Link to={`/parameter/${parameter.id}`}>
      <div className="parameters-list-item">
        <h3>Помещение: {parameter.room.room_number} | Ответственный: {parameter.responsible.first_name} {parameter.responsible.last_name}</h3>
        <div className="parameters-and-info">
          <div className="parameters">
            {renderParameterSets(parameter.parameter_sets)}
          </div>
          <div className="info">
            <div className="parameter-item">
              <span>Дата и время:</span> {getTime(parameter.created_at)}
            </div>
            <div className="parameter-item">
              <span>Средство измерения:</span> {parameter.measurement_instrument ? parameter.measurement_instrument.name : 'Нет информации'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListItem;