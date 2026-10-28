# FurniSpace — Furniture E-Commerce Frontend

Furnispace is a furniture e-commerce web application built using **React, Vite, and Tailwind CSS**. It provides a responsive shopping interface where customers can explore furniture products, manage their shopping carts, and place orders.

The frontend communicates with a Node.js and Express REST API connected to MongoDB.

## Tech Stack

| Technology | Purpose |
| React | Frontend user interface |
| Vite | Development server and build tool |
| Tailwind CSS | Responsive styling |
| React Router | Client-side navigation |
| Axios | HTTP requests and API integration |
| JavaScript | Application logic |
| Vercel | Frontend deployment |

## Features

- Responsive furniture shopping interface
- User registration and login
- JWT-based authentication
- Furniture product browsing
- Product categories and product details
- Shopping cart management
- Order placement and order history
- Customer profile management
- Product reviews and ratings
- Backend REST API integration
- Environment-based API configuration

*Feature availability depends on the implementation and backend configuration.*

## Getting Started

### Prerequisites

Install the following:

- Node.js (a supported LTS version)
- npm
- Git
- A running Furnispace backend API

### 1. Clone the Repository

```bash
git clone <your-frontend-repository-url>
cd <your-frontend-folder>
```

Replace the placeholders with your actual GitHub repository URL and frontend directory.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the frontend project root directory.

```env
VITE_API_URL=http://localhost:5000/api
```

For the deployed backend, configure:

```env
VITE_API_URL=https://your-render.com/api
```

The API URL must include `/api` because the backend routes are mounted under that prefix.

Do not commit `.env` files containing sensitive values to GitHub. Note that variables beginning with `VITE_` are included in the client build and must not contain secrets.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

`http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The production files are generated in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
```

## API Integration

The frontend uses Axios to communicate with the backend.

Example `src/services/api.js`:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### API Endpoints

The frontend integrates with the following backend route groups:

| Endpoint | Description |
| `/api/auth` | Authentication |
| `/api/users` | User management |
| `/api/categories` | Furniture categories |
| `/api/products` | Furniture products |
| `/api/cart` | Shopping cart |
| `/api/orders` | Order management |
| `/api/reviews` | Product reviews |

Example login request:

```javascript
import api from "./api";

const response = await api.post("/auth/login", {
  email,
  password,
});
```

When `VITE_API_URL` ends with `/api`, this request targets `/api/auth/login`.

## Deployment on Vercel

1. Push the frontend project to GitHub.
2. Import the repository into Vercel.
3. Select **Vite** as the framework preset.
4. Configure the project root directory if necessary.
5. Set the build command to `npm run build`.
6. Set the output directory to `dist`.
7. Add the environment variable `VITE_API_URL`.
8. Deploy the application.

### Production Environment Variable

| Name | Value |
| `VITE_API_URL` | `https://your-render.com/api` |

After updating environment variables, redeploy the frontend so Vite includes the new values in the production build.

### React Router Configuration

If your application uses React Router with browser history, configure Vercel to serve `index.html` for frontend routes.

Create `vercel.json` in the frontend root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This prevents 404 errors when refreshing frontend pages such as `/login` or `/products`.

## Troubleshooting

### Route Not Found: `/auth/login`

Ensure `VITE_API_URL` includes the `/api` prefix:

```env
VITE_API_URL=https://your-render.com/api
```

The final login endpoint must be `/api/auth/login`, not `/auth/login`.

### CORS Errors

Ensure the backend allows the deployed frontend origin. The allowed origin should not contain an unnecessary trailing slash.

### API Works Locally but Not on Vercel

Verify that the environment variable is configured in Vercel's project settings, redeploy the application, and inspect the failed request in the browser's Network tab.

### Authentication Issues

Check that the backend is running, the API URL is correct, the authentication endpoint exists, and the JWT token is included in authenticated requests.

## Security Considerations

- Store backend credentials and database connection strings only on the server.
- Never put secrets inside `VITE_` environment variables.
- Use HTTPS in production.
- Enforce authentication and authorization on the backend.
- Validate incoming data on the server.
- Keep project dependencies updated.

## Future Improvements

- Advanced furniture search and filtering
- Wishlist functionality
- Payment gateway integration
- Product recommendations
- Enhanced accessibility
- Performance optimization
- Improved mobile shopping experience

## License

No license has been specified for this project. Add a `LICENSE` file if you intend to define permissions for reuse or distribution.

---

Furnispace — Furniture E-Commerce Web Application

Built with React, Vite, Tailwind CSS, and REST API integration
