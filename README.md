# 🔒 Secure E2EE Chat Application  

A **private and secure** real-time chat application with **end-to-end encryption (E2EE)** to ensure user conversations remain confidential. Built with a **seamless UI**, real-time messaging, and **strong encryption protocols** for enhanced security.  

## 🚀 Features  
✅ **End-to-End Encryption (E2EE)** – Messages are encrypted client-side and decrypted only by the recipient  
✅ **Real-Time Messaging** – Powered by **Socket.io** for instant communication  
✅ **Modern UI & Smooth Animations** – Built using **Tailwind CSS & Motion**  
✅ **Secure Key Exchange** – Uses **X25519 + Ed25519 key pairs** for strong encryption  
✅ **AES-GCM + PBKDF2 Cryptography** – Ensuring data security & privacy  
✅ **Scalable Backend** – Node.js + Express + MongoDB for efficient data handling  

## 🛠 Tech Stack  
- **Frontend:** React, Tailwind CSS, Motion  
- **Backend:** Node.js, Express, MongoDB, Socket.io  
- **Security:** X25519 + Ed25519 key pairs, AES-GCM + PBKDF2  

## 🔧 Installation & Setup (Add your own environment variables)  

## App Dashboard

![work-5](https://github.com/user-attachments/assets/9ed3ccf3-eb18-4b2d-b9b6-fc7ca7bcfc43)

## 🛠 Live Url

[https://tipmeatreat.vercel.app](https://chatthisway.vercel.app/)

### 1️⃣ Clone the repository  
```sh
git clone https://github.com/yourusername/secure-chat-app.git
cd secure-chat-app
cd Server
npm i
npm run dev
cd Client
npm audit fix --force
npm run dev
