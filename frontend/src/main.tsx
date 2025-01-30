import React from 'react'
import {createRoot} from 'react-dom/client'
import "./Auth.module.css";

import { LoginForm } from './LoginForm'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <LoginForm/>
    </React.StrictMode>
)
