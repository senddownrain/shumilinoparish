import { createRouter, createWebHistory } from 'vue-router';

import AddressListView from '../views/AddressListView.vue';
import AddressDetailView from '../views/AddressDetailView.vue';
import AddressEditView from '../views/AddressEditView.vue';
import AddressCreateView from '../views/AddressCreateView.vue';

import PeopleListView from '../views/PeopleListView.vue';
import PeopleDetailView from '../views/PeopleDetailView.vue';
import PeopleEditView from '../views/PeopleEditView.vue';
import PeopleCreateView from '../views/PeopleCreateView.vue';

const routes = [
  {
    path: '/',
    name: 'AddressList',
    component: AddressListView,
  },
  {
    path: '/address/new',
    name: 'AddressCreate',
    component: AddressCreateView,
  },
  {
    path: '/address/:id',
    name: 'AddressDetail',
    component: AddressDetailView,
    props: true,
  },
  {
    path: '/address/:id/edit',
    name: 'AddressEdit',
    component: AddressEditView,
    props: true,
  },

  // --- Люди ---
  {
    path: '/people',
    name: 'PeopleList',
    component: PeopleListView,
  },
  {
    path: '/people/new',
    name: 'PeopleCreate',
    component: PeopleCreateView,
  },
  {
    path: '/people/:id',
    name: 'PeopleDetail',
    component: PeopleDetailView,
    props: true,
  },
  {
    path: '/people/:id/edit',
    name: 'PeopleEdit',
    component: PeopleEditView,
    props: true,
  },
  {
  path: "/addresses/print",
  name: "AddressPrint",
  component: () => import("../views/AddressPrintView.vue"),
},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;