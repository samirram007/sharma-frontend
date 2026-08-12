import { toast } from 'sonner'

import axios, { type AxiosRequestConfig } from 'axios'
import axiosClient from '@/utils/axios-client'
import { removeEmptyStrings } from './removeEmptyStrings'
// import { removeEmptyStrings } from "./removeEmptyStrings";

export const getData = async (apiPath: string, config?: AxiosRequestConfig) => {
  return await axiosClient
    .get(apiPath, config)
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      //  console.log("Error in getData:", err);
      errorHandler(err)
      throw err
    })
}
export const postData = async (apiPath: string, payload: object) => {
  // console.log(apiPath, removeEmptyStrings(payload))
  return await axiosClient
    .post(apiPath, removeEmptyStrings(payload))
    .then((response) => {
      successHandler(response)
      return response.data
    })
    .catch((err) => {
      // console.log("Error", err)
      errorHandler(err)
      throw err
    })
}
export const putData = async (apiPath: string, payload: object) => {
  console.log(apiPath, removeEmptyStrings(payload))
  return await axiosClient
    .put(apiPath, removeEmptyStrings(payload))
    .then((response) => {
      successHandler(response)
      return response.data
    })
    .catch((err) => {
      errorHandler(err)
      throw err
    })
}
export const patchData = async (apiPath: string, payload: object) => {
  return await axiosClient
    .patch(apiPath, removeEmptyStrings(payload))
    .then((response) => {
      successHandler(response)
      return response.data
    })
    .catch((err) => {
      errorHandler(err)
      throw err
    })
}

export const deleteData = async (apiPath: string) => {
  return await axiosClient
    .delete(apiPath)
    .then((response) => {
      successHandler(response)
      return response.data
    })
    .catch((err) => {
      errorHandler(err)
      throw err
    })
}

const successHandler = (response: any) => {
  toast.message(response?.data.message)
}

const errorHandler = (error: any) => {
  // Requests aborted via AbortSignal are intentional (e.g. the user cancelled
  // an export mid-fetch) — not failures worth surfacing as toasts.
  if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') return

  // Check if the error is from a response with data (usually API error responses)
  // console.log("ResponseError", error);

  if (error.response?.data) {
    // console.log('error here...', error.response.data)
    // return
    // If there are validation errors (e.g., from form submissions)
    if (error.response.data?.errors) {
      // Loop through each error in the errors object
      Object.keys(error.response.data.errors).forEach((field) => {
        const fieldErrors = error.response.data.errors[field]
        // You can show individual field errors using toast or another method
        // console.log('error here...', error.response.data)
        fieldErrors.forEach((errorMessage: any) => {
          // console.log('res', errorMessage)
          // if errorMessage contains "session expired", customize the message
          if (errorMessage.includes('Session expired')) {
            errorMessage = 'Your session has expired. Please log in again.'
          }
          // Longer duration so error messages (e.g. invalid login
          // credentials) stay visible long enough to be noticed
          toast.error(`${errorMessage}`, { duration: 6000 })
        })
      })
    } else if (error.response.data.message) {
      // If there's a general message (e.g., non-validation error)
      // toast.error(error.response.data.message);
    } else {
      // Fallback for unexpected error responses
      toast.error('An unexpected error occurred.', { duration: 6000 })
    }
  } else {
    // Handle other error types, such as network errors or timeout errors
    toast.error('Network or server error occurred.', { duration: 6000 })
  }
}
