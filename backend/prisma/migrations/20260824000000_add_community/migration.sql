CREATE TABLE "community_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_reactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_reactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "community_posts_category_idx" ON "community_posts"("category");
CREATE INDEX "community_posts_created_at_idx" ON "community_posts"("created_at");
CREATE INDEX "community_comments_post_id_created_at_idx" ON "community_comments"("post_id", "created_at");
CREATE INDEX "community_reactions_user_id_idx" ON "community_reactions"("user_id");
CREATE UNIQUE INDEX "community_reactions_post_id_user_id_key" ON "community_reactions"("post_id", "user_id");

ALTER TABLE "community_posts"
ADD CONSTRAINT "community_posts_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "Users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_comments"
ADD CONSTRAINT "community_comments_post_id_fkey"
FOREIGN KEY ("post_id") REFERENCES "community_posts"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_comments"
ADD CONSTRAINT "community_comments_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "Users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_reactions"
ADD CONSTRAINT "community_reactions_post_id_fkey"
FOREIGN KEY ("post_id") REFERENCES "community_posts"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_reactions"
ADD CONSTRAINT "community_reactions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "Users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
