import '../../static/style/popup.scss';
import {
  captureScreenshot,
  getPresets,
  saveScreenshotWithURL,
  setNewPresetToDatabase,
} from '../functions/paramsFunctions';
import { gui } from '../guiDebug';
import { IProfile } from '../types/register';
import { IPresetsProps, IAppConfigOptions } from '../types/types';
import registerUI from './register/register';
import { loginResponse, registerResponse } from './register/utils';
import { createEl, createContainer, heading, hr, progress } from './utils';

const removeProgress = (parentID: string) => {
  const parent = document.getElementById(parentID);
  const loadingEl = document.querySelector('#loader');

  if (parent) loadingEl && parent.removeChild(loadingEl);
};

const closeButton = () => {
  const close = createEl('span');
  close.className = 'material-symbols-outlined close-button';
  close.innerText = 'close';
  return close;
};

const image = (src: string = 'https://picsum.photos/800/400') => {
  const img = createEl('img');
  const imgContainer = createEl('div');
  imgContainer.className = 'image-container';
  imgContainer.id = 'image-container';

  const loading = progress();
  imgContainer.appendChild(loading);

  img.onload = () => {
    removeProgress('image-container');
  };

  imgContainer.appendChild(img);

  img.src = src;

  return imgContainer;
};

const button = (
  { text, attr }: { text: string; attr?: Record<string, any> },
  func: (e: any) => void
): HTMLButtonElement => {
  const btn = createEl('button', attr);
  btn.textContent = text;
  btn.addEventListener('click', func);
  return btn;
};

const header = () => {
  const title = heading('h1', 'Preview New Preset');
  const headerSection = createContainer('popup-header');
  headerSection.appendChild(title);
  return headerSection;
};

const contentBody = (screenshot: string | undefined) => {
  const contents = createEl('div', { id: 'popup-content' });
  const img = image(screenshot);
  contents.appendChild(img);
  return contents;
};

const footerSaveCancelButtons = (onSave: any, isLoggedIn: boolean = true) => {
  const container = createContainer('popup-footer');

  const save = button(
    {
      text: 'Save',
      attr: {
        className: 'save-button',
      },
    },
    () => {
      save.disabled = true;
      onSave().then(({ data, status, message }) => {
        try {
          const resultUi = result(data.message, status);
          console.log('🚀 ~ onSave ~ resultUi:', resultUi);
          removeProgress('popup');
        } catch (error) {
          result(message, status);
          save.disabled = false;
          removeProgress('popup');
        }
      });
    }
  );

  const loginRegister = button(
    {
      text: 'Login | Register',
      attr: {
        className: 'login-register-button',
        disabled: true,
      },
    },
    onSave
  );

  loginRegister.setAttribute('name', 'login-register-button');
  // loginRegister.onclick = () => {
  //   console.log('Test');
  //   onSave();
  // };

  const cancel = button(
    { text: 'Cancel', attr: { className: 'cancel-button' } },
    () => {
      // if (popup) closeHandler(body, popup);
      closePopupWindow();
    }
  );

  let currentStatus: null | HTMLButtonElement = null;

  if (isLoggedIn) {
    currentStatus = save;
  } else {
    currentStatus = loginRegister;
  }

  container.append(currentStatus, cancel);
  return { container, save, cancel, loginRegister };
};

const popupWindow = (...content: HTMLElement[]): HTMLElement => {
  const body = document.body;
  const fullWindow = createEl('div', { id: 'popup' });
  const container = createContainer('popup-container');
  const close = closeButton();
  let isCustomClose: boolean = false;
  content.forEach((el: HTMLElement) => {
    container.append(el);

    if (el.id === 'custom-close') {
      isCustomClose = true;
    }
  });

  container.append(close);

  if (!isCustomClose) {
    close.addEventListener('click', () => {
      closePopupWindow();
    });
  } else {
    close.addEventListener('click', () => {
      const parent = document.getElementById('failed-popup');
      if (parent) closeHandler(body, parent, 'failed-popup-container');
    });
  }

  fullWindow.append(container);

  body.append(fullWindow);

  // transition helper
  setTimeout(() => {
    container.classList.add('visible');
  }, 0);

  return fullWindow;
};

//   /**
//    * Pop up function.
//    *             ___
//    *             |x|
//    * ______________
//    * |   header   |
//    * ______________
//    * |    Body    |
//    * ______________
//    * |   Footer   |
//    * ______________
//    */
function savePresetPopup(
  screenshot: string | undefined,
  new_preset: IPresetsProps,
  appConfig: IAppConfigOptions,
  isLogged: boolean
) {
  let result: any = '';

  const registerParent = registerUI();
  const register = registerParent.container;
  const profile: IProfile = registerParent.profile;
  const currentStatus = registerParent.currentStatus;

  const currentPreset: IPresetsProps = { ...new_preset };
  delete currentPreset.preset.geometryParams.font;

  const headerSection = header();
  const contents = contentBody(screenshot);
  const nameLabel = createEl('label', {
    id: 'name-label',
    title: 'Enter your name to be shown in the presets.',
  });

  nameLabel.textContent = 'Your Name';
  nameLabel.setAttribute('for', 'name-input');

  const nameInput = createEl('input', { id: 'name-input' });
  nameInput.disabled = !isLogged;

  const hrLine = hr();

  const nameContainer = createContainer('name-container');
  // let currentContainer: HTMLDivElement;

  // footer

  const footerContainer = createContainer('footer-container');

  const test = () => {
    console.log('profile', profile);
    console.log('currentStatus', currentStatus);
    if (currentStatus.status === 'login') {
      return loginResponse(profile);
    } else if (currentStatus.status === 'register') {
      return registerResponse(profile);
    }
  };

  if (!isLogged) {
    const loginRegisterFooterAction = footerSaveCancelButtons(test, isLogged);
    const registerLoginButton = loginRegisterFooterAction.save;
    registerLoginButton.disabled = !profile.email || !profile.password;

    footerContainer.append(register, loginRegisterFooterAction.container);
    footerContainer.style.flexDirection = 'column';
  } else {
    const saveToDatabase = async () => {
      const loading = progress();
      fullWindow!.append(loading);
      const response: any = await setNewPresetToDatabase(
        screenshot,
        currentPreset
      );
      if ('data' in response) {
        const { data } = response;
        const { screenshotUrl } = data;
        if (data.success) {
          currentPreset.preset.screenshot = screenshotUrl;
          appConfig.presets?.push(currentPreset);
          appConfig.updatePresets!(currentPreset);
        }
      } else {
        // Handle the case where 'data' doesn't exist
        console.error('Error in response:', response);
      }

      return response;
    };

    let savePresetsFooterAction = footerSaveCancelButtons(
      saveToDatabase,
      isLogged
    );

    const saveButton = savePresetsFooterAction.save;
    saveButton.disabled = !currentPreset.created_by.length;
    footerContainer.append(nameContainer, savePresetsFooterAction.container);
  }

  nameContainer.append(nameLabel, nameInput);
  nameInput.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    currentPreset.created_by = target.value;
  });
  // container.append(headerSection, contents, hrLine, footerContainer);
  const fullWindow = popupWindow(
    headerSection,
    contents,
    hrLine,
    footerContainer
  );

  return result;
}

// Handlers
function closeHandler(
  parent: HTMLElement,
  node: HTMLElement,
  containerID?: string
) {
  const container = document.getElementById(containerID || 'popup-container');
  container!.style.transform = 'scale(0.2)';
  container!.style.opacity = '0';
  container!.style.transition = 'opacity 2s ease, transform 0.7s ease-in-out';
  container!.classList.remove('visible');
  container!.addEventListener('transitionend', () => {
    parent.removeChild(node);
    gui.show();
  });
}

function closePopupWindow() {
  const body = document.body;
  const popup = document.getElementById('popup');

  closeHandler(body, popup!);
}

function result(responseMessage: string, statusCode: number) {
  const currentContainer = document.querySelector(
    '#popup-container'
  ) as HTMLElement;

  if (currentContainer) {
    if (statusCode === 200) {
      closePopupWindow();
    }
  }

  const popup = popupWindow;

  let content = createContainer('result-container');
  let message = createEl('p', { className: 'result-message' });

  function success() {
    const icon = createEl('span', { className: 'success-icon' });
    icon.classList.add('material-symbols-outlined');
    icon.textContent = 'done';

    message.textContent = responseMessage;
    content.append(icon, message);
    return icon;
  }

  function failed() {
    const icon = createEl('span', { className: 'failed-icon' });
    icon.classList.add('material-symbols-outlined');
    icon.textContent = 'close';

    message.textContent = responseMessage;
    content.append(icon, message);
    content.id = 'custom-close';
    const containerID = 'failed-popup-container';

    const failedPopup = popup(content);
    failedPopup.id = 'failed-popup';
    const defaultContainer = failedPopup.children.namedItem('popup-container');
    defaultContainer && (defaultContainer.id = containerID);

    return failedPopup;
  }

  if (statusCode === 200) {
    success();
    return popup(content);
  }

  if (statusCode !== 200) {
    return failed();
    // return popup(content);
  }
}

function saveScreenshotPopup(screenshot: string) {
  let fileName = '';
  const headerSection = header();
  const contents = contentBody(screenshot);
  const nameContainer = createContainer('name-container');

  const nameLabel = createEl('label', {
    id: 'name-label',
    title: 'Enter your name to be shown in the presets.',
  });

  nameLabel.textContent = 'Your Name';
  nameLabel.setAttribute('for', 'name-input');

  const nameInput = createEl('input', { id: 'name-input' });

  nameInput.addEventListener('input', function (e: any) {
    fileName = e?.target?.value;
  });

  const footerContainer = createContainer('footer-container');

  nameContainer.append(nameLabel, nameInput);

  const hrLine = hr();
  const footerAction = footerSaveCancelButtons(() =>
    saveScreenshotWithURL(screenshot, fileName || 'screenshot.png')
  );

  footerContainer.append(nameContainer, footerAction.container);

  const fullWindow = popupWindow(
    headerSection,
    contents,
    hrLine,
    footerContainer
  );

  return fullWindow;
}

export default function popupHandler(
  screenshot: string,
  new_preset: IPresetsProps,
  appConfig: IAppConfigOptions
) {
  // TODO add isLoggedIn for the user in the last argument.
  savePresetPopup(screenshot, new_preset, appConfig, appConfig.user.isLoggedIn);
}

export { popupWindow, saveScreenshotPopup };
