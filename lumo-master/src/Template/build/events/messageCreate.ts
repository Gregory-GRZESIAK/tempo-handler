import { EventBuilder } from '../../../Handler/build/base/components/EventBuilder.js';

export default EventBuilder({
    name: 'messageCreate',
    description: 'A message create event',
    category: 'Template'
}, async (message) => {
    console.log('Hello World!');
}); 


