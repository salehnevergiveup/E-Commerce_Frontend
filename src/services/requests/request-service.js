import axiosClients from '../auth/axios-Instance-service';
import RequestMethod from '../../enums/request-methods';

/**
 * @param {string} method 
 * @param {string} url  
 * @param {Object | FormData} payload 
 * @param {boolean} requireAuth 
 * @param {Object} [customHeaders]
 * @returns {Promise} 
 */

export async function sendRequest(method, url, payload = null, requireAuth = false, customHeaders = {}) {

  if (!Object.values(RequestMethod).includes(method)) {
    throw new Error(`Invalid request method: ${method}`);
  }

  let processedData = payload;

  if (payload && typeof payload === 'object') {
    processedData = await prepareFormData(payload);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  const requestData = {
    method,
    url,
    headers,
    data: processedData,
  };

  const requestClient = requireAuth ? axiosClients.auth : axiosClients.public;

  try {
    const response = await requestClient(requestData);
    return response.data;

  } catch (error) {
    if (error.response.data) {
      return {
        error: true,
        message: error.response.data.message || 'Server Error',
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        error: true,
        message: 'Network Error. No response received from server.',
        status: 503,  // Service Unavailable
      };
    } else {
      return {
        error: true,
        message: error.message || 'An unexpected error occurred',
        status: 500,
      };
    }
  }
}

//later delete this function
export async function testRequest(method, url, payload = null, requireAuth = false, customHeaders = {}) {

  if (!Object.values(RequestMethod).includes(method)) {
    throw new Error(`Invalid request method: ${method}`);
  }

  let processedData = payload;

  if (payload && typeof payload === 'object') {
    processedData = await prepareFormData(payload);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  const requestData = {
    method,
    url,
    headers,
    data: processedData,
  };
  
}


/**
 * @param {File} file 
 * @returns {Promise<string>} 
 */
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    // On successful reading
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };

    // On error
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

/**
* @param {Object} data - 
* @param {FileList} files 
* @returns {Promise<Object>} 
*/

/**
* Prepares form data by converting any File objects to Base64 strings.
* @param {Object} data - The form data as key-value pairs.
* @returns {Promise<Object>} - The processed form data with Base64 media.
*/
export async function prepareFormData(data) {
  const preparedData = { ...data };
  for (const key in preparedData) {
    if (preparedData.hasOwnProperty(key)) {
      const value = preparedData[key];

      if (value instanceof File) {
        try {
          const base64 = await convertFileToBase64(value);
          preparedData[key] = base64;
        } catch (error) {
          console.error(`Error converting file for key "${key}":`, error);
          throw new Error('Failed to process the media file.');
        }
      }
    }
  }
  return preparedData;
}

export default sendRequest;