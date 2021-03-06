/**
 * @flow
 */
import {type ConfigT} from 'types';
export default {
  name: 'config',
  description: 'Print CLI configuration',
  func: async (argv: string[], ctx: ConfigT) => {
    console.log(JSON.stringify(ctx, null, 2));
  },
};
