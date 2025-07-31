import { supabase } from './supabase';
import { locationService, LocationCoords } from './location';
import { Vendor, Order } from './supabase';

export interface VendorAllocationResult {
  vendor?: Vendor;
  distance?: number;
  estimatedTime?: number;
  error?: string;
}

class VendorAllocationService {
  // Find nearest available vendor
  async findNearestVendor(
    customerLocation: LocationCoords,
    requiredBrands: string[]
  ): Promise<VendorAllocationResult> {
    try {
      // Get all online and verified vendors
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select(`
          *,
          inventory (
            brand,
            stock,
            is_available
          )
        `)
        .eq('is_online', true)
        .eq('is_verified', true);

      if (error) {
        return { error: 'Failed to fetch vendors' };
      }

      if (!vendors || vendors.length === 0) {
        return { error: 'No vendors available at the moment' };
      }

      // Filter vendors who have the required brands in stock
      const availableVendors = vendors.filter(vendor => {
        const vendorBrands = vendor.inventory?.map((item: any) => item.brand) || [];
        const hasRequiredBrands = requiredBrands.every(brand => 
          vendorBrands.includes(brand) && 
          vendor.inventory?.find((item: any) => item.brand === brand && item.stock > 0 && item.is_available)
        );
        return hasRequiredBrands;
      });

      if (availableVendors.length === 0) {
        return { error: 'No vendors have the requested brands in stock' };
      }

      // Calculate distances and find nearest vendor
      let nearestVendor: Vendor | null = null;
      let shortestDistance = Infinity;

      for (const vendor of availableVendors) {
        if (vendor.location) {
          const distance = locationService.calculateDistance(
            customerLocation,
            vendor.location
          );

          // Check if customer is within vendor's service radius
          if (distance <= vendor.service_radius && distance < shortestDistance) {
            shortestDistance = distance;
            nearestVendor = vendor;
          }
        }
      }

      if (!nearestVendor) {
        return { error: 'No vendors available in your area' };
      }

      // Estimate delivery time (assuming 30 km/h average speed + 5 min preparation)
      const estimatedTime = Math.ceil((shortestDistance / 30) * 60) + 5; // in minutes

      return {
        vendor: nearestVendor,
        distance: shortestDistance,
        estimatedTime,
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to allocate vendor' };
    }
  }

  // Auto-assign order to nearest vendor
  async autoAssignOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          delivery_address,
          items
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return { success: false, error: 'Order not found' };
      }

      // Extract required brands from order items
      const requiredBrands = order.items.map((item: any) => item.brand);

      // Find nearest vendor
      const allocationResult = await this.findNearestVendor(
        {
          latitude: order.delivery_address.latitude,
          longitude: order.delivery_address.longitude,
        },
        requiredBrands
      );

      if (allocationResult.error || !allocationResult.vendor) {
        return { success: false, error: allocationResult.error };
      }

      // Update order with assigned vendor
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          vendor_id: allocationResult.vendor.id,
          estimated_delivery_time: new Date(
            Date.now() + (allocationResult.estimatedTime || 15) * 60000
          ).toISOString(),
          status: 'pending',
        })
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: 'Failed to assign vendor to order' };
      }

      // Send notification to vendor (you can implement push notifications here)
      await this.notifyVendor(allocationResult.vendor.id, orderId);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Auto-assignment failed' };
    }
  }

  // Get all vendors within radius
  async getVendorsInRadius(
    location: LocationCoords,
    radius: number = 10
  ): Promise<{ vendors: Vendor[]; error?: string }> {
    try {
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_online', true)
        .eq('is_verified', true);

      if (error) {
        return { vendors: [], error: 'Failed to fetch vendors' };
      }

      // Filter vendors within radius
      const nearbyVendors = vendors?.filter(vendor => {
        if (!vendor.location) return false;
        const distance = locationService.calculateDistance(location, vendor.location);
        return distance <= radius;
      }) || [];

      return { vendors: nearbyVendors };
    } catch (error: any) {
      return { vendors: [], error: error.message || 'Failed to get nearby vendors' };
    }
  }

  // Notify vendor about new order (placeholder for push notifications)
  private async notifyVendor(vendorId: string, orderId: string): Promise<void> {
    try {
      // Insert notification record
      await supabase
        .from('notifications')
        .insert({
          user_id: vendorId,
          type: 'new_order',
          title: 'New Order Received',
          message: `You have a new order #${orderId.slice(-6)}`,
          data: { order_id: orderId },
          is_read: false,
        });

      // Here you would integrate with a push notification service
      // like Firebase Cloud Messaging or Expo Push Notifications
      console.log(`Notification sent to vendor ${vendorId} for order ${orderId}`);
    } catch (error) {
      console.error('Failed to notify vendor:', error);
    }
  }

  // Update vendor location (for live tracking)
  async updateVendorLocation(
    vendorId: string,
    location: LocationCoords
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ location })
        .eq('id', vendorId);

      if (error) {
        return { success: false, error: 'Failed to update location' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Location update failed' };
    }
  }

  // Get vendor's current orders for live tracking
  async getVendorActiveOrders(vendorId: string): Promise<{ orders: Order[]; error?: string }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            full_name,
            phone
          ),
          delivery_address
        `)
        .eq('vendor_id', vendorId)
        .in('status', ['accepted', 'preparing', 'out_for_delivery'])
        .order('created_at', { ascending: false });

      if (error) {
        return { orders: [], error: 'Failed to fetch orders' };
      }

      return { orders: orders || [] };
    } catch (error: any) {
      return { orders: [], error: error.message || 'Failed to get active orders' };
    }
  }
}

export const vendorAllocationService = new VendorAllocationService();