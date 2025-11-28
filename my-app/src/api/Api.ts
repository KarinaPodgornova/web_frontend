/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface SerializerCurrentDeviceJSON {
  amount?: number;
  amperage?: number;
  curr_dev_id?: number;
  current_id?: number;
  device_id?: number;
}

export interface SerializerCurrentJSON {
  created_at?: string;
  creator_login?: string;
  current_id?: number;
  finish_date?: string;
  form_date?: string;
  moderator_login?: string;
  status?: string;
  voltage_bord?: number;
}

export interface SerializerDeviceJSON {
  coeff_efficiency?: number;
  coeff_reserve?: number;
  current_required?: number;
  description?: string;
  device_id?: number;
  image?: string;
  in_stock?: boolean;
  is_delete?: boolean;
  name?: string;
  power_nominal?: number;
  resistance?: number;
  type?: string;
  voltage_nominal?: number;
}

export interface SerializerStatusJSON {
  /** Статус заявки */
  status?: string;
}

export interface SerializerUserJSON {
  id?: string;
  is_moderator?: boolean;
  login?: string;
  password?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Current API
 * @version 1.0
 * @license MIT
 * @contact API Support <support@current.com> (http://localhost)
 *
 * API для определения необходимой силы тока
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  currentCalculations = {
    /**
     * @description Возвращает заявки с возможностью фильтрации по датам и статусу
     *
     * @tags Currents
     * @name CurrentCalculationsList
     * @summary Получить список заявок на расчёт
     * @request GET:/current-calculations/current-calculations
     * @secure
     */
    currentCalculationsList: (
      query?: {
        /** Начальная дата (YYYY-MM-DD) */
        "from-date"?: string;
        /** Конечная дата (YYYY-MM-DD) */
        "to-date"?: string;
        /** Статус заявки */
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerCurrentJSON[], Record<string, string>>({
        path: `/current-calculations/current-calculations`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает информацию о текущей заявке-черновике на расчёт пользователя
     *
     * @tags Currents
     * @name CurrentCartList
     * @summary Получить корзину расчёта
     * @request GET:/current-calculations/current-cart
     * @secure
     */
    currentCartList: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/current-calculations/current-cart`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает полную информацию о заявке
     *
     * @tags Currents
     * @name CurrentCalculationsDetail
     * @summary Получить заявку по ID
     * @request GET:/current-calculations/{id}
     * @secure
     */
    currentCalculationsDetail: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/current-calculations/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Выполняет логическое удаление заявки
     *
     * @tags Currents
     * @name DeleteCurrentCalculationsDelete
     * @summary Удалить заявка
     * @request DELETE:/current-calculations/{id}/delete-current-calculations
     * @secure
     */
    deleteCurrentCalculationsDelete: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/current-calculations/${id}/delete-current-calculations`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные заявки
     *
     * @tags Currents
     * @name EditCurrentCalculationsUpdate
     * @summary Изменить заявка
     * @request PUT:/current-calculations/{id}/edit-current-calculations
     * @secure
     */
    editCurrentCalculationsUpdate: (
      id: number,
      current: SerializerCurrentJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerCurrentJSON, Record<string, string>>({
        path: `/current-calculations/${id}/edit-current-calculations`,
        method: "PUT",
        body: current,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Изменяет статус заявки (только для модераторов)
     *
     * @tags Currents
     * @name FinishUpdate
     * @summary Завершить заявку
     * @request PUT:/current-calculations/{id}/finish
     * @secure
     */
    finishUpdate: (
      id: number,
      status: SerializerStatusJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerCurrentJSON, Record<string, string>>({
        path: `/current-calculations/${id}/finish`,
        method: "PUT",
        body: status,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Переводит заявку в статус "formed"
     *
     * @tags Currents
     * @name FormUpdate
     * @summary Сформировать заявку
     * @request PUT:/current-calculations/{id}/form
     * @secure
     */
    formUpdate: (id: number, params: RequestParams = {}) =>
      this.request<SerializerCurrentJSON, Record<string, string>>({
        path: `/current-calculations/${id}/form`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  currentDevices = {
    /**
     * @description Обновляет параметры устройства в конкретной заявке
     *
     * @tags current_devices
     * @name CurrentDevicesUpdate
     * @summary Изменить данные устройства в заявке
     * @request PUT:/current-devices/{current_id}/{device_id}
     * @secure
     */
    currentDevicesUpdate: (
      deviceId: number,
      currentId: number,
      data: SerializerCurrentDeviceJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerCurrentDeviceJSON, Record<string, string>>({
        path: `/current-devices/${currentId}/${deviceId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет связь устройства и заявки
     *
     * @tags current_devices
     * @name CurrentDevicesDelete
     * @summary Удалить устройство из заявки
     * @request DELETE:/current-devices/{current_id}/{device_id}
     * @secure
     */
    currentDevicesDelete: (
      deviceId: number,
      currentId: number,
      params: RequestParams = {},
    ) =>
      this.request<SerializerCurrentJSON, Record<string, string>>({
        path: `/current-devices/${currentId}/${deviceId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  devices = {
    /**
     * @description Возвращает все устройства или фильтрует по названию
     *
     * @tags devices
     * @name DevicesList
     * @summary Получить список устройств
     * @request GET:/devices
     */
    devicesList: (
      query?: {
        /** Название устройства для поиска */
        device_name?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerDeviceJSON[], Record<string, string>>({
        path: `/devices`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Создает новое устройство и возвращает его данные
     *
     * @tags devices
     * @name CreateDeviceCreate
     * @summary Создать новое устройство
     * @request POST:/devices/create-device
     * @secure
     */
    createDeviceCreate: (
      device: SerializerDeviceJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerDeviceJSON, Record<string, string>>({
        path: `/devices/create-device`,
        method: "POST",
        body: device,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает информацию об устройстве по её идентификатору
     *
     * @tags devices
     * @name DevicesDetail
     * @summary Получить устройство по ID
     * @request GET:/devices/{id}
     */
    devicesDetail: (id: number, params: RequestParams = {}) =>
      this.request<SerializerDeviceJSON, Record<string, string>>({
        path: `/devices/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет устройство в заявку-черновик пользователя
     *
     * @tags devices
     * @name AddToCurrentCalculationCreate
     * @summary Добавить устройство в расчёт
     * @request POST:/devices/{id}/add-to-current-calculation
     * @secure
     */
    addToCurrentCalculationCreate: (id: number, params: RequestParams = {}) =>
      this.request<SerializerCurrentJSON, Record<string, string>>({
        path: `/devices/${id}/add-to-current-calculation`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Выполняет логическое удаление устройство по ID
     *
     * @tags devices
     * @name DeleteDeviceDelete
     * @summary Удалить устройство
     * @request DELETE:/devices/{id}/delete-device
     * @secure
     */
    deleteDeviceDelete: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/devices/${id}/delete-device`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет информацию об устройстве по ID
     *
     * @tags devices
     * @name EditDeviceUpdate
     * @summary Изменить данные устройства
     * @request PUT:/devices/{id}/edit-device
     * @secure
     */
    editDeviceUpdate: (
      id: number,
      device: SerializerDeviceJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerDeviceJSON, Record<string, string>>({
        path: `/devices/${id}/edit-device`,
        method: "PUT",
        body: device,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Загружает изображение для устройства и возвращает обновленные данные
     *
     * @tags devices
     * @name ImageCreate
     * @summary Загрузить изображение устройства
     * @request POST:/devices/{id}/image
     * @secure
     */
    imageCreate: (
      id: number,
      data: {
        /** Изображение устройства */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/devices/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Принимает логин/пароль, возвращает jwt-токен в формате {"token":"..."}.
     *
     * @tags users
     * @name SigninCreate
     * @summary Вход (получение токена)
     * @request POST:/signin
     */
    signinCreate: (
      credentials: SerializerUserJSON,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/users/signin`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет токен текущего пользователя из хранилища. Возвращает {"status":"signed_out"}.
     *
     * @tags users
     * @name SignoutCreate
     * @summary Выход (удаление токена)
     * @request POST:/users/signout
     * @secure
     */
    signoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/users/signout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Регистрирует нового пользователя. Возвращает URL созданного ресурса в Location и тело созданного пользователя.
     *
     * @tags users
     * @name SignupCreate
     * @summary Регистрация пользователя
     * @request POST:/signup
     */
    signupCreate: (user: SerializerUserJSON, params: RequestParams = {}) =>
      this.request<SerializerUserJSON, Record<string, string>>({
        path: `/users/signup`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает данные профиля (доступен только тот, чей UUID совпадает с user_id в токене).
     *
     * @tags users
     * @name GetUsers
     * @summary Получить профиль пользователя
     * @request GET:/users/{login}/me
     * @secure
     */
    getUsers: (login: string, params: RequestParams = {}) =>
      this.request<SerializerUserJSON, Record<string, string>>({
        path: `/users/${login}/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет профиль пользователя (может делать только сам пользователь).
     *
     * @tags users
     * @name PutUsers
     * @summary Изменить профиль пользователя
     * @request PUT:/users/{login}/me
     * @secure
     */
    putUsers: (
      login: string,
      user: SerializerUserJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerUserJSON, Record<string, string>>({
        path: `/users/${login}/me`,
        method: "PUT",
        body: user,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
