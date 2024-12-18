'use server'

import { db } from '../_lib/prisma'
import bcrypt from 'bcryptjs'

export const registerUser = async (data: {
  name: string
  email: string
  password: string
  phone: string
  address_zipcode: string
  address_street: string
  address_number: string
  address_neighbor: string
  address_city: string
  address_state: string
  roleId: string
}) => {
  // Criptografar a senha antes de salvar
  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Verifica se o roleId é válido
  if (data.roleId !== '1' && data.roleId !== '2') {
    throw new Error('Escolha uma opção: Mashguiach ou Restaurante!')
  }
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new Error(
      'Este e-mail já está em uso, volte a página de login e clique em esqueci minha senha, caso você esqueceu sua senha!',
    )
    return false
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${data.address_zipcode}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
  )

  let lat = ''
  let lng = ''

  const geoData = await response.json()
  if (geoData.results && geoData.results.length > 0) {
    const location = geoData.results[0].geometry.location
    lat = location.lat.toString()
    lng = location.lng.toString()
  }

  await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address_zicode: data.address_zipcode,
      address_street: data.address_street,
      address_number: data.address_number,
      address_neighbor: data.address_neighbor,
      address_city: data.address_city,
      address_state: data.address_state,
      address_lat: lat,
      address_lng: lng,
      password: hashedPassword, // Armazena a senha criptografada
      roleId: parseInt(data.roleId),
    },
  })
}

export const registerUserStore = async (data: {
  name: string
  email: string
  password: string
  phone: string
  address_zipcode: string
  address_street: string
  address_number: string
  address_neighbor: string
  address_city: string
  address_state: string
  roleId: string
  title: string
  comercialPhone: string
  storeTypeId: string
}) => {
  // Criptografar a senha antes de salvar
  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Verifica se o roleId é válido
  if (data.roleId !== '1' && data.roleId !== '2') {
    throw new Error('Escolha uma opção: Mashguiach ou Restaurante!')
  }
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new Error(
      'Este e-mail já está em uso, volte a página de login e clique em esqueci minha senha, caso você esqueceu sua senha!',
    )
    return false
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${data.address_zipcode}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
  )

  let lat = ''
  let lng = ''

  const geoData = await response.json()
  if (geoData.results && geoData.results.length > 0) {
    const location = geoData.results[0].geometry.location
    lat = location.lat.toString()
    lng = location.lng.toString()
  }

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address_zicode: data.address_zipcode,
      address_street: data.address_street,
      address_number: data.address_number,
      address_neighbor: data.address_neighbor,
      address_city: data.address_city,
      address_state: data.address_state,
      address_lat: lat,
      address_lng: lng,
      password: hashedPassword, // Armazena a senha criptografada
      roleId: 2,
    },
  })

  const store = await db.stores.create({
    data: {
      title: data.title,
      phone: data.phone,
      comercialPhone: data.comercialPhone,
      storeTypeId: data.storeTypeId,
      address_zipcode: data.address_zipcode,
      address_street: data.address_street,
      address_number: data.address_number,
      address_neighbor: data.address_neighbor,
      address_city: data.address_city,
      address_state: data.address_state,
      userId: user.id,
      isMashguiach: false,
      mashguiachId: '',
      isAutomated: false,
    },
  })
  console.log('Usuário e loja criados com sucesso!')
  console.log(user)
  console.log(store)
  return { user, store }
}
