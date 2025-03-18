
import { CommandBuilderOptions, ExecuteFunction, Command } from '../interfaces/main.js'

export const CommandBuilder = <T extends CommandBuilderOptions>(
    options: T,
    callback: ExecuteFunction<T>
): Command<T> => {
    const command: Command<T> = {
        options,
        execute: callback
    };

    return command;
};
