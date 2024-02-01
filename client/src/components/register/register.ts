import axios from 'axios';
import { popupWindow } from '../popup';
import { createContainer, createEl, createInputWithLabel } from '../utils';
import {
  ValidateEmail,
  isEmailExistHandler,
  registerResponse,
  loginResponse,
} from './utils';
import { IProfile } from '../../types/register';

function getButton() {
  const loginRegisterButton = document.getElementsByName(
    'login-register-button'
  )[0];

  return loginRegisterButton;
}

function registerUI() {
  const profile: IProfile = {
    displayedName: '',
    email: '',
    password: '',
  };

  const currentStatus = {
    status: '',
  };

  const checkIfAllFieldFilled = () => {
    const loginRegisterButton = getButton();
    loginRegisterButton.setAttribute('disabled', 'true');

    if (
      currentStatus.status === 'login' &&
      profile.email.length &&
      profile.password.length > 6
    ) {
      loginRegisterButton.removeAttribute('disabled');
    }

    if (
      profile.displayedName.length &&
      profile.email.length &&
      profile.password.length > 6
    ) {
      loginRegisterButton.removeAttribute('disabled');
    }
  };

  const displayedNameHandler = (e: any) => {
    profile.displayedName = '';
    const displayedName = e.target.value;

    if (displayedName.length) {
      profile.displayedName = displayedName;
    }

    setTimeout(() => {
      checkIfAllFieldFilled();
    }, 100);

    return displayedName;
  };

  const emailHandler = async (e: any) => {
    const loginRegisterButton = getButton();

    profile.email = '';
    const email = e.target.value;
    const isExist = await isEmailExistHandler(email);
    const icon = document.getElementsByName('status')[0];
    const iconContainer = document.getElementsByName('login-register')[0];

    setTimeout(() => {
      if (isExist === false) {
        profile.email = email;
        icon.textContent = 'done';
        icon.classList.remove('loader-rotate');
        iconContainer.classList.remove('error-bg');
        iconContainer.classList.add('done-bg');

        form.append(displayedName, password);
        loginRegisterButton.textContent = 'Register';
        currentStatus.status = 'register';
        return email;
      } else if (isExist) {
        icon.textContent = 'done_all';
        icon.classList.remove('loader-rotate');
        iconContainer.classList.add('done-bg');

        profile.email = email;
        form.appendChild(password);
        loginRegisterButton.textContent = 'Login';

        if (form.contains(displayedName)) {
          form.removeChild(displayedName);
        }

        currentStatus.status = 'login';
        checkIfAllFieldFilled();
        return email;
      }
    }, 10);

    setTimeout(() => {
      checkIfAllFieldFilled();
    }, 100);
  };

  const passwordHandler = (e) => {
    profile.password = '';
    const password = e.target.value;
    if (password.length) {
      profile.password = password;
    }

    setTimeout(() => {
      checkIfAllFieldFilled();
    }, 100);

    return password;
  };

  const container = createContainer('login-register-container');

  const form = createEl('form');
  form.classList.add('login-register-form');

  const displayedName = createInputWithLabel(
    'displayed name',
    {},
    {
      func: displayedNameHandler,
    }
  );

  const emailEl = createInputWithLabel('email', undefined, {
    func: emailHandler,
    type: 'keyup',
  });

  const password = createInputWithLabel(
    'password',
    {
      inputAttr: { type: 'password' },
    },
    {
      func: passwordHandler,
    }
  );

  displayedName.title =
    'this name will be displayed in public when posting a saving a new preset';

  form.appendChild(emailEl);

  container.append(form);
  return { container, profile, currentStatus };
}

export default registerUI;
