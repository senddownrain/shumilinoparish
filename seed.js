// seed.js — сидер для Firestore (addresses, people, marriages)
//
// Запуск из корня проекта:
//   node seed.js
//
// Требования:
//   - "type": "module" в package.json
//   - firebase-node.js экспортирует db (Firestore) для Node

import {
  collection,
  addDoc,
  writeBatch,
  doc,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase-node.js';

const ADDRESSES_COLLECTION = 'addresses';
const PEOPLE_COLLECTION = 'people';
const MARRIAGES_COLLECTION = 'marriages';

async function clearCollection(colName) {
  console.log(`--- Очищаем коллекцию ${colName} ---`);
  const colRef = collection(db, colName);
  const snapshot = await getDocs(colRef);
  const batch = writeBatch(db);

  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  if (!snapshot.empty) {
    await batch.commit();
    console.log(`  ✔ Удалено документов: ${snapshot.size}`);
  } else {
    console.log('  Коллекция уже пуста');
  }
}

async function seed() {
  console.log('=== Запуск сидера Firestore (addresses, people, marriages) ===');

  try {
    // 1. Очищаем старые данные: сначала браки, потом люди, потом адреса
    await clearCollection(MARRIAGES_COLLECTION);
    await clearCollection(PEOPLE_COLLECTION);
    await clearCollection(ADDRESSES_COLLECTION);

    // 2. Адреса
    console.log('--- Создаём тестовые адреса ---');
    const addressesCol = collection(db, ADDRESSES_COLLECTION);

    const addressesData = [
      {
        localityType: 'посёлок',
        localityName: 'Шумилино',
        street: 'Ленина',
        house: '10',
        apartment: '5',
        phoneHome: '+375 29 000 00 00',
        visitYears: [2018, 2019, 2022],
      },
      {
        localityType: 'город',
        localityName: 'Витебск',
        street: 'Октябрьская',
        house: '25А',
        apartment: '',
        phoneHome: '',
        visitYears: [2020, 2021],
      },
      {
        localityType: 'деревня',
        localityName: 'Лесная',
        street: 'Центральная',
        house: '3',
        apartment: '',
        phoneHome: '+375 29 555 55 55',
        visitYears: [2017, 2020, 2023],
      },
    ];

    const addressDocs = [];
    for (const addr of addressesData) {
      const docRef = await addDoc(addressesCol, addr);
      addressDocs.push({ id: docRef.id, ...addr });
      console.log(
        `  ✔ Адрес добавлен: ${addr.localityName}, ${addr.street} ${addr.house} (id=${docRef.id})`
      );
    }

    const [addrShumilino, addrVitebsk, addrLesnaya] = addressDocs;

    // 3. Люди (с полом и полями смерти, без брачных полей)
    console.log('--- Создаём людей ---');
    const peopleCol = collection(db, PEOPLE_COLLECTION);

    const peopleBaseData = [
      // Семья Ивановых в Шумилино
      {
        key: 'ivan',
        data: {
          firstName: 'Иван',
          lastName: 'Иванов',
          middleName: 'Петрович',
          sex: 'male',
          birthDate: '1980-03-15',
          profession: 'Учитель',
          workplace: 'Школа №1',
          religion: 'католик',
          phone: '+375 29 111 11 11',
          baptismYear: 1988,
          chrismationYear: 1989,
          firstCommunionYear: 1988,
          catechesis: true,
          massAndConfession: 'регулярно',
          addressId: addrShumilino.id,
          fatherId: null,
          motherId: null,
          childrenIds: [],
          isDeceased: false,
          deathYear: null,
          marriageIds: [],
        },
      },
      {
        key: 'maria',
        data: {
          firstName: 'Мария',
          lastName: 'Иванова',
          middleName: 'Александровна',
          sex: 'female',
          birthDate: '1982-07-20',
          profession: 'Медсестра',
          workplace: 'Больница Шумилино',
          religion: 'католик',
          phone: '+375 29 222 22 22',
          baptismYear: 1989,
          chrismationYear: 1990,
          firstCommunionYear: 1989,
          catechesis: false,
          massAndConfession: 'часто',
          addressId: addrShumilino.id,
          fatherId: null,
          motherId: null,
          childrenIds: [],
          isDeceased: false,
          deathYear: null,
          marriageIds: [],
        },
      },
      {
        key: 'pavel',
        data: {
          firstName: 'Павел',
          lastName: 'Иванов',
          middleName: 'Иванович',
          sex: 'male',
          birthDate: '2005-11-05',
          profession: 'Студент',
          workplace: 'Колледж',
          religion: 'католик',
          phone: '+375 29 333 33 33',
          baptismYear: 2006,
          chrismationYear: 2015,
          firstCommunionYear: 2013,
          catechesis: true,
          massAndConfession: 'редко',
          addressId: addrShumilino.id,
          fatherId: null, // заполним позже
          motherId: null,
          childrenIds: [],
          isDeceased: false,
          deathYear: null,
          marriageIds: [],
        },
      },

      // Анна Петрова в Витебске (есть прошлый брак, разведена)
      {
        key: 'anna',
        data: {
          firstName: 'Анна',
          lastName: 'Петрова',
          middleName: 'Сергеевна',
          sex: 'female',
          birthDate: '1975-02-10',
          profession: 'Бухгалтер',
          workplace: 'Частная фирма',
          religion: 'православный',
          phone: '+375 29 444 44 44',
          baptismYear: 1976,
          chrismationYear: 1977,
          firstCommunionYear: 1977,
          catechesis: false,
          massAndConfession: 'раз в год',
          addressId: addrVitebsk.id,
          fatherId: null,
          motherId: null,
          childrenIds: [],
          isDeceased: false,
          deathYear: null,
          marriageIds: [],
        },
      },

      // Елена Павлова в Лесной (например, вдова)
      {
        key: 'elena',
        data: {
          firstName: 'Елена',
          lastName: 'Павлова',
          middleName: 'Николаевна',
          sex: 'female',
          birthDate: '1955-09-01',
          profession: 'Пенсионер',
          workplace: '',
          religion: 'католик',
          phone: '+375 29 555 55 55',
          baptismYear: 1956,
          chrismationYear: 1957,
          firstCommunionYear: 1957,
          catechesis: false,
          massAndConfession: 'давно',
          addressId: addrLesnaya.id,
          fatherId: null,
          motherId: null,
          childrenIds: [],
          isDeceased: false,
          deathYear: null,
          marriageIds: [],
        },
      },

      // Сергей Петров — бывший муж Анны (разведён)
      {
        key: 'sergey',
        data: {
          firstName: 'Сергей',
          lastName: 'Петров',
          middleName: 'Иванович',
          sex: 'male',
          birthDate: '1972-01-15',
          profession: 'Инженер',
          workplace: 'Завод',
          religion: 'православный',
          phone: '+375 29 666 66 66',
          baptismYear: 1973,
          chrismationYear: 1974,
          firstCommunionYear: 1974,
          catechesis: false,
          massAndConfession: 'редко',
          addressId: addrVitebsk.id,
          fatherId: null,
          motherId: null,
          childrenIds: [],
          isDeceased: false,
          deathYear: null,
          marriageIds: [],
        },
      },
    ];

    const keyToId = {};
    const createdPeople = [];

    for (const person of peopleBaseData) {
      const docRef = await addDoc(peopleCol, person.data);
      keyToId[person.key] = docRef.id;
      createdPeople.push({ id: docRef.id, ...person.data });
      console.log(
        `  ✔ Человек добавлен: ${person.data.lastName} ${person.data.firstName} (id=${docRef.id})`
      );
    }

    // 4. Связи "родители ↔ дети" для Павла
    console.log('--- Обновляем родителей и детей ---');
    const batchPeople = writeBatch(db);

    const ivanId = keyToId['ivan'];
    const mariaId = keyToId['maria'];
    const pavelId = keyToId['pavel'];

    if (ivanId && mariaId && pavelId) {
      const ivanRef = doc(db, PEOPLE_COLLECTION, ivanId);
      const mariaRef = doc(db, PEOPLE_COLLECTION, mariaId);
      const pavelRef = doc(db, PEOPLE_COLLECTION, pavelId);

      batchPeople.update(pavelRef, {
        fatherId: ivanId,
        motherId: mariaId,
      });

      batchPeople.update(ivanRef, {
        childrenIds: [pavelId],
      });

      batchPeople.update(mariaRef, {
        childrenIds: [pavelId],
      });
    }

    await batchPeople.commit();

    // 5. Создаём браки
    console.log('--- Создаём браки ---');
    const marriagesCol = collection(db, MARRIAGES_COLLECTION);
    const batchMarriages = writeBatch(db);

    const marriagesToCreate = [];

    // Активный брак Ивана (муж) и Марии (жена)
    if (ivanId && mariaId) {
      const marriageRef = doc(marriagesCol); // auto id
      marriagesToCreate.push({
        ref: marriageRef,
        data: {
          husbandId: ivanId,
          wifeId: mariaId,
          status: 'active',
          civilMarriageYear: 2005,
          churchMarriageYear: 2006,
          isChurchMarried: true,
          divorceYear: null,
          notes: 'Основной брак',
        },
      });

      // добавим ссылку на этот брак в обоих людях
      batchMarriages.update(doc(db, PEOPLE_COLLECTION, ivanId), {
        marriageIds: [marriageRef.id],
      });
      batchMarriages.update(doc(db, PEOPLE_COLLECTION, mariaId), {
        marriageIds: [marriageRef.id],
      });
    }

    // Прошлый брак Анны (жена) и Сергея (муж), статус "разведены"
    const annaId = keyToId['anna'];
    const sergeyId = keyToId['sergey'];

    if (annaId && sergeyId) {
      const marriageRef = doc(marriagesCol);
      marriagesToCreate.push({
        ref: marriageRef,
        data: {
          husbandId: sergeyId,
          wifeId: annaId,
          status: 'divorced',
          civilMarriageYear: 1998,
          churchMarriageYear: null,
          isChurchMarried: false,
          divorceYear: 2010,
          notes: 'Бывший брак',
        },
      });

      // Анна и Сергей имеют этот брак в истории
      batchMarriages.update(doc(db, PEOPLE_COLLECTION, annaId), {
        marriageIds: [marriageRef.id],
      });
      batchMarriages.update(doc(db, PEOPLE_COLLECTION, sergeyId), {
        marriageIds: [marriageRef.id],
      });
    }

    // Записываем все браки
    for (const m of marriagesToCreate) {
      batchMarriages.set(m.ref, m.data);
      console.log(
        `  ✔ Брак добавлен: husband=${m.data.husbandId} wife=${m.data.wifeId} (status=${m.data.status})`
      );
    }

    await batchMarriages.commit();

    console.log(
      `=== Сидинг завершён. Адресов: ${addressesData.length}, людей: ${peopleBaseData.length}, браков: ${marriagesToCreate.length} ===`
    );
  } catch (e) {
    console.error('❌ Ошибка при сидинге базы:', e);
  } finally {
    process.exit(0);
  }
}

seed();