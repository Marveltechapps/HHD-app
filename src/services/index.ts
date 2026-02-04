/**
 * Services Index
 * Central export for all services
 */

export { apiService } from './api.service';
export { authService } from './auth.service';
export { orderService } from './order.service';
export { bagService } from './bag.service';
export { itemService } from './item.service';
export { rackService } from './rack.service';
export { taskService } from './task.service';
export { photoService } from './photo.service';
export { statisticsService } from './statistics.service';

export type { ApiResponse, ApiError } from './api.service';
export type { User, SendOTPRequest, SendOTPResponse, VerifyOTPRequest, VerifyOTPResponse, GetMeResponse } from './auth.service';
export type { Order, CreateOrderRequest, UpdateOrderStatusRequest } from './order.service';
export type { Bag, ScanBagRequest, UpdateBagRequest } from './bag.service';
export type { Item, ScanItemRequest, UpdateItemRequest } from './item.service';
export type { Rack, ScanRackRequest } from './rack.service';
export type { Task, UpdateTaskRequest } from './task.service';
export type { Photo, UploadPhotoRequest } from './photo.service';
