import { SimpleFiber } from '../core/SimpleFiber';

export function fiberToDOM(fiber: SimpleFiber): HTMLElement | Text {
  let dom: HTMLElement | Text;
  
  if (fiber.type === 'text') {
    dom = document.createTextNode(fiber.props.value || '');
  } else {
    dom = document.createElement(fiber.type);
    
    Object.entries(fiber.props).forEach(([key, value]) => {
      if (key === 'className') {
        (dom as HTMLElement).className = value as string;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign((dom as HTMLElement).style, value);
      } else if (key.startsWith('on')) {
        const eventName = key.substring(2).toLowerCase();
        (dom as HTMLElement).addEventListener(eventName, value as EventListener);
      } else if (key !== 'children' && key !== 'value') {
        (dom as HTMLElement).setAttribute(key, String(value));
      }
    });
  }
  
  fiber.stateNode = dom;
  return dom;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function commitWork(fiber: SimpleFiber | null, container: HTMLElement) {
  if (!fiber) return;
  
  if (fiber.effectTag === 'PLACEMENT' && fiber.stateNode) {
    container.appendChild(fiber.stateNode);
  } else if (fiber.effectTag === 'UPDATE' && fiber.stateNode) {
    updateDOM(fiber.stateNode, fiber.oldProps, fiber.props);
  } else if (fiber.effectTag === 'DELETION' && fiber.stateNode) {
    container.removeChild(fiber.stateNode);
  }
  
  if (fiber.child) {
    const childContainer = fiber.stateNode as HTMLElement || container;
    commitWork(fiber.child, childContainer);
  }
  
  if (fiber.sibling) {
    commitWork(fiber.sibling, container);
  }
}

export function updateDOM(dom: HTMLElement | Text, oldProps: any, newProps: any) {
  if (dom instanceof Text) {
    if (oldProps.value !== newProps.value) {
      dom.textContent = newProps.value;
    }
    return;
  }
  
  const element = dom as HTMLElement;
  
  Object.keys(oldProps).forEach(key => {
    if (key !== 'children' && !(key in newProps)) {
      if (key === 'className') {
        element.className = '';
      } else if (key.startsWith('on')) {
        const eventName = key.substring(2).toLowerCase();
        element.removeEventListener(eventName, oldProps[key]);
      } else {
        element.removeAttribute(key);
      }
    }
  });
  
  Object.entries(newProps).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value as string;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on')) {
      if (oldProps[key] !== value) {
        const eventName = key.substring(2).toLowerCase();
        if (oldProps[key]) {
          element.removeEventListener(eventName, oldProps[key]);
        }
        element.addEventListener(eventName, value as EventListener);
      }
    } else if (key !== 'children') {
      element.setAttribute(key, String(value));
    }
  });
}

export function createDOMTree(fiber: SimpleFiber): HTMLElement | Text | null {
  const dom = fiberToDOM(fiber);
  
  let child = fiber.child;
  while (child) {
    const childDOM = createDOMTree(child);
    if (childDOM && dom instanceof HTMLElement) {
      dom.appendChild(childDOM);
    }
    child = child.sibling;
  }
  
  return dom;
}

