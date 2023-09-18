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

  useEffect(() => {
    getParameters();
  }, [filterData]);

  // const getParameters = async () => {
  //   try {
  //     const url = new URL('http://localhost:8000/api/parameters/filter/');
  //     url.searchParams.append('responsible', filterData.responsible);
  //     url.searchParams.append('room', filterData.room);
  
  //     if (filterData.date) {
  //       url.searchParams.append('date', filterData.date);
  //     }
  
  //     const response = await fetch(url.toString(), {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: 'Bearer ' + String(authTokens.access),
  //       },
  //     });
  //     const data = await response.json();
  
  //     console.log('Response:', response);
  //     console.log('Data:', data);
  
  //     if (response.status === 200) {
  //       setParameters(data);
  //     } else if (response.status === 401) {
  //       logoutUser();
  //     }
  //   } catch (error) {
  //     console.error('Error fetching parameters:', error);
  //   }
  // };

  const getParameters = async () => {
    try {
      const url = new URL('http://localhost:8000/api/parameters/filter/');
  
      if (filterData.responsible) {
        url.searchParams.append('responsible', filterData.responsible);
      }
  
      if (filterData.room) {
        url.searchParams.append('room', filterData.room);
      }
  
      if (filterData.date) {
        url.searchParams.append('date', filterData.date);
      }
  
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + String(authTokens.access),
        },
      });
  
      const data = await response.json();
  
      console.log('Response:', response);
      console.log('Data:', data);
  
      if (response.status === 200) {
        setParameters(data);
      } else if (response.status === 401) {
        logoutUser();
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
    }
  };

  return (
    <div className='page-container'>
      <FilterParameters onFilterChange={setFilterData} onResetFilters={() => setFilterData({})} />
      <div className='parameters-list'>
        {parameters.map((parameter, index) => (
          <ListItem key={index} parameter={parameter} />
        ))}
      </div>
      <AddButton />
    </div>
  );
};

export default ParametersListPage;