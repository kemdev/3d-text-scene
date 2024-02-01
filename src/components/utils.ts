type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const createEl = <T extends keyof HTMLElementTagNameMap>(
  tag: T,
  params?: Record<string, string>
): HTMLElementTagNameMap[T] => {
  const { className, id, ...attributes } = params || {};

  const element = document.createElement(tag);

  if (className) element.classList.add(className);
  if (id) element.id = id;

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
};

const progress = () => {
  const span = createEl('span');
  span.innerText = 'progress_activity';
  span.classList.add('material-symbols-outlined', 'loader');
  span?.classList.add('loader-rotate');
  span.id = 'loader';

  return span;
};

/**
 * @param name - will be its id and class name.
 */
const createContainer = (
  name: string,
  attributes?: Record<string, string>
): HTMLDivElement => {
  return createEl('div', {
    id: name,
    className: name,
    ...attributes,
  });
};

const hr = () => createEl('hr', { id: 'hr' });

const heading = (heading: HeadingLevel, title: string): HTMLHeadingElement => {
  const el = createEl(heading);
  el.textContent = title;

  return el;
};

/**
 * @param name - By default @name: will added to the "for" attribute, you can use the input id as well
 * @param attributes {OPTIONAL} you can pass the labelAttributes and Input attributes.
 * NOTE ex. if username passed then the attribute name will be "input-username" and also the same for the label "label-username"
 */
const createInputWithLabel = (
  name: string,
  attributes?: {
    labelAttr?: Record<string, string>;
    inputAttr?: Record<string, string>;
  },
  event?: {
    func: (e: Event) => {};
    type?: keyof GlobalEventHandlersEventMap;
  }
) => {
  const func = event?.func;
  const type = event?.type || 'input';
  const container = createContainer('input-label-container');
  const inputProgressContainer = createContainer('input-progress-container');
  const progressContainer = createContainer('progress-container');

  const status = progress();

  status.setAttribute('name', 'status');
  status.classList.add('email-loader');

  const label = createEl('label', {
    ...attributes?.labelAttr,
    name: 'label-' + name,
  });

  label.setAttribute('for', attributes?.inputAttr?.id || name);
  label.textContent = name;

  const input = createEl('input', {
    id: name,
    name: 'input-' + name,
    value: '',
    class: 'input-default',
    ...attributes?.inputAttr,
  });

  inputProgressContainer.append(input, progressContainer);

  progressContainer.appendChild(status);
  progressContainer.setAttribute('name', 'login-register');

  if (func) input.addEventListener(type, func);

  container.append(label, inputProgressContainer);

  return container;
};

export {
  createEl,
  createContainer,
  heading,
  hr,
  progress,
  createInputWithLabel,
};
