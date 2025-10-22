import { EffectTag } from '../types/fiber.types';

export class SimpleFiber {
  type: string;
  props: any;
  child: SimpleFiber | null = null;
  sibling: SimpleFiber | null = null;
  parent: SimpleFiber | null = null;
  alternate: SimpleFiber | null = null;
  effectTag: EffectTag = null;
  stateNode: HTMLElement | Text | null = null;
  oldProps: any = null;

  constructor(type: string, props: any) {
    this.type = type;
    this.props = props;
  }
}

