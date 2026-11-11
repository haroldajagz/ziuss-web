// Mounts the Agentation review toolbar on the page. Local preview only.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';

const host = document.createElement('div');
host.id = 'agentation-root';
document.body.appendChild(host);
createRoot(host).render(<Agentation endpoint="http://localhost:4747" />);
