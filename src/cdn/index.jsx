import { render } from 'https://cdn.skypack.dev/react-dom';
import React from 'https://cdn.skypack.dev/react';
import './index.css';

let Greet = () => <h1 className="app">Hello, esbuild!</h1>;

render(<Greet />, document.getElementById('root'));
