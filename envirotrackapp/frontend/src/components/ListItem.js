// import React from 'react';
// import { Link } from 'react-router-dom';
// import './ListItem.css';

// const ListItem = ({ parameter }) => {
//   const getTime = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   return (
//     <Link to={`/parameter/${parameter.id}`}>
//       <div className="parameters-list-item">
//         <h3>Помещение: {parameter.room.room_number} | Ответственный: {parameter.responsible.first_name} {parameter.responsible.last_name}</h3>
//         <div className="parameters">
//           <div className="parameter-item">
//             <span>Температура, °C:</span> {parameter.temperature_celsius}
//           </div>
//           <div className="parameter-item">
//             <span>Влажность, %:</span> {parameter.humidity_percentage}
//           </div>
//           <div className="parameter-item">
//             <span>Давление, кПа:</span> {parameter.pressure_kpa}
//           </div>
//           <div className="parameter-item">
//             <span>Давление, (ммРС):</span> {parameter.pressure_mmhg}
//           </div>
//           <div className="parameter-item">
//             <span>Дата и время:</span> {getTime(parameter.date_time)}
//           </div>
//           <div className="parameter-item">
//             <span>Средство измерения:</span> {parameter.measurement_instrument ? parameter.measurement_instrument.name : 'Нет информации'}
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default ListItem;

import React from 'react';
import { Link } from 'react-router-dom';
import './ListItem.css';

const ListItem = ({ parameter }) => {
  const getTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderParameterSet = (parameterSet) => {
    if (!parameterSet) return 'Прочерк';

    const parameters = [
      'temperature_celsius',
      'humidity_percentage',
      'pressure_kpa',
      'pressure_mmhg',
    ];

    return parameters.map(param => (
      <div key={param}>
        {param}: {parameterSet[param]} 
      </div>
    ));
  };

  return (
    <Link to={`/parameters/${parameter.id}`}>
      <div className="parameters-list-item">
        <h3>Помещение: {parameter.room.room_number} | Ответственный: {parameter.responsible.first_name} {parameter.responsible.last_name}</h3>
        <div className="parameters">
          <div className="parameter-item">
            <span>Утренний набор:</span> {renderParameterSet(parameter.morning_parameter_set)}
          </div>
          <div className="parameter-item">
            <span>Вечерний набор:</span> {renderParameterSet(parameter.evening_parameter_set)}
          </div>
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