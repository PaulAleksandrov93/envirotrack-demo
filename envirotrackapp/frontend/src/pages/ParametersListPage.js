import React, { useState, useEffect, useContext } from 'react';
import ListItem from '../components/ListItem';
import AddButton from '../components/AddButton';
import AuthContext from '../context/AuthContext';
import FilterParameters from '../components/FilterParameters';
import './ParametersListPage.css'; 

const ParametersListPage = () => {
  const [parameters, setParameters] = useState([]);
  const [filterData, setFilterData] = useState({});
  const { authTokens, logoutUser } = useContext(AuthContext);

  const getParameters = async () => {
    try {
      const url = new URL('http://localhost:8000/api/parameters/');
      const searchParams = new URLSearchParams();

      if (filterData.responsible) searchParams.append('responsible', filterData.responsible);
      if (filterData.room) searchParams.append('room', filterData.room);
      if (filterData.date) searchParams.append('date', filterData.date);

      url.search = searchParams.toString();

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens.access}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setParameters(data);
      } else if (response.status === 401) {
        logoutUser();
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
    }
  };

  useEffect(() => {
    getParameters();
  }, [filterData, authTokens, logoutUser]);

  return (
    <div className='page-container'>
      <FilterParameters onFilterChange={setFilterData} onResetFilters={() => setFilterData({})} />
      <div className='parameters-list'>
        {parameters.map((parameter) => (
          <ListItem key={parameter.id} parameter={parameter} />
        ))}
      </div>
      <AddButton />
    </div>
  );
};

export default ParametersListPage;