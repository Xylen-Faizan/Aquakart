# Razorpay Order Creation Edge Function

This Supabase Edge Function handles the creation of Razorpay orders for processing payments.

## Environment Variables

You need to set the following environment variables in your Supabase project:

- `RAZORPAY_KEY_ID`: Your Razorpay API key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay API key secret

## Local Development

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Set environment variables locally:
   ```bash
   supabase secrets set RAZORPAY_KEY_ID=your_key_id RAZORPAY_KEY_SECRET=your_key_secret
   ```

4. Start the local development server:
   ```bash
   supabase functions serve create-razorpay-order --no-verify-jwt
   ```

## Deploying

To deploy the function to your Supabase project:

```bash
supabase functions deploy create-razorpay-order --project-ref your-project-ref
```

## API Endpoint

- **URL**: `/functions/v1/create-razorpay-order`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Body

```json
{
  "amount": 100.00,
  "currency": "INR",
  "receipt": "order_rcpt_123",
  "notes": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

### Response

```json
{
  "id": "order_123",
  "amount": 10000,
  "currency": "INR",
  "receipt": "order_rcpt_123",
  "status": "created",
  "created_at": 1639999999
}
```

## Error Handling

The API will return appropriate HTTP status codes and error messages in case of failures.
