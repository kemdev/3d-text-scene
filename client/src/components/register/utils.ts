import axios from 'axios';
import { progress } from '../utils';
import { IProfile } from '../../types/register';

function ValidateEmail(email: string) {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
}

async function isEmailExistHandler(email: string) {
  const isValid = ValidateEmail(email);
  const icon = document.getElementsByName('status')[0];
  const iconContainer = document.getElementsByName('login-register')[0];

  const loginRegisterButton = document.getElementsByName(
    'login-register-button'
  )[0];
  loginRegisterButton.setAttribute('disabled', 'true');

  const progressContainer = document.getElementById('progress-container');

  iconContainer.classList.remove('done-bg');
  if (!isValid) {
    icon.textContent = 'close';
    iconContainer.classList.add('error-bg');
  }

  try {
    if (isValid) {
      icon.textContent = 'progress_activity';
      iconContainer.classList.remove('error-bg');
      icon.classList.add('loader-rotate');
      progressContainer?.classList.add('progress-container-visible');
      // loginRegisterButton.removeAttribute('disabled');

      const url = '/users/check-email-exists';
      const response = await axios.get(url, {
        params: {
          email,
        },
      });

      return response.data.isExist;
    }
  } catch (error) {
    console.log('Error', error);
  }
}

async function registerResponse(data: IProfile) {
  console.log('Now it is signup');
  const dataJson = JSON.stringify(data);
  console.log('🚀 ~ registerResponse ~ data:', data);
  const config = {
    headers: { 'content-type': 'application/json' },
    data: dataJson,
  };
  const response = await axios.post('/users/signup', config);
  console.log('🚀 ~ registerResponse ~ response:', response);

  return response;
}

async function loginResponse(data) {
  console.log('Now it is Login');
}

export { ValidateEmail, isEmailExistHandler, registerResponse, loginResponse };
