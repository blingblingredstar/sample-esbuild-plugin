import Server from 'react-dom/server';
import { PATH } from 'env';

console.log(`PATH is ${PATH}`);

const Greet = () => <h1>Hello, esbuild!</h1>;
console.log(Server.renderToString(<Greet />));
