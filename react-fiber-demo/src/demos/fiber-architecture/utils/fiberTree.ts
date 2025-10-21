import { SimpleFiber } from '../core/SimpleFiber';
import { VirtualElement } from '../types/fiber.types';

export function* createFiberTree(
  element: VirtualElement,
  parent: SimpleFiber | null = null
): Generator<SimpleFiber> {
  const fiber = new SimpleFiber(element.type, element.props);
  fiber.parent = parent;
  yield fiber;
  
  if (!element.children?.length) return fiber;
  
  let prevSibling: SimpleFiber | null = null;
  
  for (let i = 0; i < element.children.length; i++) {
    const childGen = createFiberTree(element.children[i], fiber);
    const childRoot = childGen.next().value;
    
    if (i === 0) {
      fiber.child = childRoot;
    } else {
      prevSibling!.sibling = childRoot;
    }
    prevSibling = childRoot;
    
    yield childRoot;
    yield* childGen;
  }
  
  return fiber;
}

export function renderFiberTreeText(
  fiber: SimpleFiber | null,
  level: number = 0
): string[] {
  if (!fiber) return [];

  const lines: string[] = [];
  const indent = '  '.repeat(level);
  
  lines.push(`${indent}<${fiber.type}> ${JSON.stringify(fiber.props).substring(0, 40)}`);

  if (fiber.child) {
    lines.push(...renderFiberTreeText(fiber.child, level + 1));
  }

  if (fiber.sibling) {
    lines.push(...renderFiberTreeText(fiber.sibling, level));
  }

  return lines;
}

