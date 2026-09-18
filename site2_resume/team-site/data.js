// ============================================================
// ДАННЫЕ УЧАСТНИКОВ КОМАНДЫ
// ============================================================
// Здесь и меняется вся информация на сайте: имена, фото, резюме.
// Код трогать не нужно — только текст внутри кавычек " ".
//
// ЧТОБЫ ПОМЕНЯТЬ ФОТО:
//   1. Положите свою фотографию в папку photos
//   2. Впишите её имя файла в поле "photo" (например "photos/ivan.jpg")
//   Подойдут файлы .jpg, .jpeg, .png
//
// ЧТОБЫ ДОБАВИТЬ ЕЩЁ ОДНОГО ЧЕЛОВЕКА:
//   Скопируйте один блок { ... } целиком (вместе с запятой после
//   закрывающей фигурной скобки) и вставьте перед последней "]".
//
// ЧТОБЫ УБРАТЬ ЧЕЛОВЕКА:
//   Удалите его блок { ... } целиком.
// ============================================================

const people = [
  {
    name: "Парахат Медет",
    role: "Frontend-разработчик",
    photo: "photos/Medet.jpg",
    education: "Astana International University, Высшая школа информационных технологий и инженерии, бакалавр Computer Science and Software, 2022–2026",
    experience: "ТОО «Astana Creative», 2024 — наст. время: разработка пользовательских интерфейсов и адаптивная вёрстка веб-приложений.",
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Git"],
    email: "medetparahad@gmail.com",
    phone: "+7 (700) 000-00-00"
  },
  {
    name: "Укенов Олжас",
    role: "Frontend-разработчик",
    photo: "photos/Olzhas.jpg",
    education: "Astana International University, Высшая школа информационных технологий и инженерии, бакалавр Computer Science and Software, 2023–2027",
    experience: "ТОО «WIT.KZ», 2024 — наст. время: веб-разработка клиентской части, вёрстка и интеграция API. Опыт работы — 2 года.",
    skills: ["HTML/CSS", "JavaScript", "Git"],
    email: "olzhas070907@gmail.com",
    phone: "+7 (708) 690-16-47"
  },
  {
    name: "Сәрсенбайұлы Аманқос",
    role: "Frontend/Backend-разработчик",
    photo: "photos/Amankos.jpg",
    education: "Astana International University, Высшая школа информационных технологий и инженерии, бакалавр Computer Science and Software, 2022–2026",
    experience: "ООО «ТМЫВ ДЕНЕГ», 2006 — наст. время: fullstack-разработка веб-приложений, проектирование серверной архитектуры и клиентских интерфейсов.",
    skills: ["JavaScript", "Node.js", "Python", "PostgreSQL", "React", "Docker"],
    email: "amankos28135@gmail.com",
    phone: "+7 (777) 913-70-96"
  }
];
