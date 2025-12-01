// services/authService.js
import { supabaseAdmin } from "../lib/supabase.js"

export async function createUser({ email, password, metadata = {} }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: metadata,
    email_confirm: false  // tu peux forcer la validation email ici
  })

  if (error) {
    throw new Error(`Impossible de créer l'utilisateur : ${error.message}`)
  }

  return data
}

export async function createConfirmedUser({ email, password, metadata = {} }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: metadata,
    email_confirm: true  // Confirme automatiquement l'email
  })

  if (error) {
    throw new Error(`Impossible de créer l'utilisateur : ${error.message}`)
  }

  return data
}

export async function getUser(userId) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (error) {
    throw new Error(`Impossible de récupérer l'utilisateur : ${error.message}`)
  }

  return data
}

export async function listUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    throw new Error(`Impossible de lister les utilisateurs : ${error.message}`)
  }

  return data.users
}

export async function deleteUser(userId) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    throw new Error(`Impossible de supprimer l'utilisateur : ${error.message}`)
  }

  return true
}