import React, { useState, useEffect } from 'react';
import './FilterParameters.css';

const FilterParameters = ({ filterData, setFilterData }) => {
  const [selectedResponsible, setSelectedResponsible] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [responsibles, setResponsibles] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Load responsibles and rooms from API and set them in the state
    // ...

  }, []);

  const handleFilterChange = () => {
    const filters = {
      responsible: selectedResponsible,
      room: selectedRoom,
      date: selectedDate,
    };
    setFilterData(filters);
  };

  const handleResetFilters = () => {
    setSelectedResponsible('');
    setSelectedRoom('');
    setSelectedDate('');
    setFilterData({});
  };

  return (
    <div className="filter-parameters">
      <select
        value={selectedResponsible}
        onChange={(e) => setSelectedResponsible(e.target.value)}
      >
        <option value="">Выберите ответственного</option>
        {responsibles.map((responsible) => (
          <option key={responsible.id} value={responsible.id}>
            {responsible.name}
          </option>
        ))}
      </select>

      <select
        value={selectedRoom}
        onChange={(e) => setSelectedRoom(e.target.value)}
      >
        <option value="">Выберите помещение</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <button className="apply-button" onClick={handleFilterChange}>
        Применить фильтры
      </button>

      <button className="reset-button" onClick={handleResetFilters}>
        Сбросить фильтры
      </button>
    </div>
  );
};

export default FilterParameters;