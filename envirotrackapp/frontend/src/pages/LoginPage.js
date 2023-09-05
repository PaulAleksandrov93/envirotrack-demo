import React, {useContext} from 'react'
import AuthContext from '../context/AuthContext'
import './LoginPage.css'; // Импортируем файл стилей


const LoginPage = () => {
  let { loginUser } = useContext(AuthContext);

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={loginUser}>
        <input type="text" name="username" placeholder="Enter Username" />
        <input type="password" name="password" placeholder="Enter Password" />
        <button type="submit" className="login-button">
          Авторизоваться
        </button>
      </form>
    </div>
  );
}
export default LoginPage