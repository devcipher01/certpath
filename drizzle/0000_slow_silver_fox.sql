CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"course_slug" text NOT NULL,
	"course_title" text NOT NULL,
	"recipient_name" text NOT NULL,
	"email" text NOT NULL,
	"order_id" integer,
	"exam_score" integer,
	"revoked" boolean DEFAULT false NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "exam_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_slug" text NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_slug" text NOT NULL,
	"course_title" text NOT NULL,
	"plan" text NOT NULL,
	"route" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"whop_plan_id" text NOT NULL,
	"whop_order_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_checkouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"course_slug" text NOT NULL,
	"course_title" text NOT NULL,
	"plan" text NOT NULL,
	"route" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"whop_plan_id" text NOT NULL,
	"whop_checkout_config_id" text NOT NULL,
	"exam_score" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"order_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pending_checkouts_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_checkouts" ADD CONSTRAINT "pending_checkouts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;