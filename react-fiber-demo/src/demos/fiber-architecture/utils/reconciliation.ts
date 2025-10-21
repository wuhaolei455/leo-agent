import { SimpleFiber } from '../core/SimpleFiber';
import { VirtualElement } from '../types/fiber.types';

export function reconcileChildren(
  currentFiber: SimpleFiber | null,
  newElements: VirtualElement[]
): { fiber: SimpleFiber; effects: string[] } | null {
  const effects: string[] = [];
  
  if (newElements.length === 0) return null;
  
  let oldFiber = currentFiber?.child || null;
  let prevSibling: SimpleFiber | null = null;
  let newFiber: SimpleFiber | null = null;
  const firstChild: SimpleFiber | null = null;
  
  for (let i = 0; i < newElements.length; i++) {
    const element = newElements[i];
    const sameType = oldFiber && oldFiber.type === element.type;
    
    if (sameType && oldFiber) {
      newFiber = new SimpleFiber(oldFiber.type, element.props);
      newFiber.stateNode = oldFiber.stateNode;
      newFiber.alternate = oldFiber;
      newFiber.effectTag = 'UPDATE';
      newFiber.oldProps = oldFiber.props;
      newFiber.parent = currentFiber;
      effects.push(`🔄 UPDATE: <${newFiber.type}> props changed`);
    } else {
      if (element) {
        newFiber = new SimpleFiber(element.type, element.props);
        newFiber.effectTag = 'PLACEMENT';
        newFiber.parent = currentFiber;
        effects.push(`➕ PLACEMENT: <${newFiber.type}> new node`);
      }
      
      if (oldFiber) {
        oldFiber.effectTag = 'DELETION';
        effects.push(`❌ DELETION: <${oldFiber.type}> removed`);
      }
    }
    
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    
    if (i === 0 && newFiber && currentFiber) {
      currentFiber.child = newFiber;
    } else if (prevSibling && newFiber) {
      prevSibling.sibling = newFiber;
    }
    
    if (newFiber) {
      prevSibling = newFiber;
    }
  }
  
  while (oldFiber) {
    oldFiber.effectTag = 'DELETION';
    effects.push(`❌ DELETION: <${oldFiber.type}> extra node removed`);
    oldFiber = oldFiber.sibling;
  }
  
  return firstChild ? { fiber: firstChild, effects } : null;
}

