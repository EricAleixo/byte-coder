// ajuste pro seu schema
import { eq } from "drizzle-orm";
import { db } from ".";
import { posts } from "./schemas";

import { InferInsertModel } from "drizzle-orm";

type NewPost = InferInsertModel<typeof posts> & {
  id: string;
};

async function seed() {
    console.log("🌱 Seeding posts...");


    const data: NewPost[] = [
        {
            id: "a1f1c1d2-1111-4a11-aaaa-111111111111",
            slug: "como-aprender-nextjs-do-zero",
            title: "Como aprender Next.js do zero",
            excerpt: "Um guia direto ao ponto para começar com Next.js hoje.",
            content:
                "Next.js é um dos frameworks mais populares do ecossistema React. Neste guia você vai aprender os fundamentos e como criar seu primeiro projeto.",
            coverImage: "https://picsum.photos/800/400?random=1",
            readTime: "6 min",
            categoryId: "07214b17-b561-4cd0-a45a-410c96374584",
            status: "PUBLISHED",
            authorId: "b0e58cbc-22a1-4fb5-b352-71e887c76b3f",
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "b2f2c2d3-2222-4b22-bbbb-222222222222",
            slug: "clean-architecture-na-pratica",
            title: "Clean Architecture na prática",
            excerpt: "Entenda como organizar seu código de forma escalável.",
            content:
                "A Clean Architecture ajuda a manter seu projeto organizado e testável. Vamos ver exemplos práticos com Node.js.",
            coverImage: "https://picsum.photos/800/400?random=2",
            readTime: "9 min",
            categoryId: "aa0c0b0e-5ad0-4e31-b37a-d7841bd0b874",
            status: "PUBLISHED",
            authorId: "b0e58cbc-22a1-4fb5-b352-71e887c76b3f",
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "c3f3c3d4-3333-4c33-cccc-333333333333",
            slug: "dicas-de-performance-no-react",
            title: "Dicas de performance no React",
            excerpt: "Melhore a performance da sua aplicação com pequenas mudanças.",
            content:
                "React pode ficar lento se mal utilizado. Aqui estão técnicas para evitar re-renderizações desnecessárias.",
            coverImage: "https://picsum.photos/800/400?random=3",
            readTime: "7 min",
            categoryId: "07214b17-b561-4cd0-a45a-410c96374584",
            status: "PUBLISHED",
            authorId: "b0e58cbc-22a1-4fb5-b352-71e887c76b3f",
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "d4f4c4d5-4444-4d44-dddd-444444444444",
            slug: "postgresql-para-iniciantes",
            title: "PostgreSQL para iniciantes",
            excerpt: "Aprenda o básico de banco de dados relacional.",
            content:
                "PostgreSQL é um banco poderoso. Vamos ver como criar tabelas, inserir dados e fazer queries simples.",
            coverImage: "https://picsum.photos/800/400?random=4",
            readTime: "10 min",
            categoryId: "aa0c0b0e-5ad0-4e31-b37a-d7841bd0b874",
            status: "PUBLISHED",
            authorId: "b0e58cbc-22a1-4fb5-b352-71e887c76b3f",
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "e5f5c5d6-5555-4e55-eeee-555555555555",
            slug: "jwt-autenticacao-explicada",
            title: "JWT: autenticação explicada",
            excerpt: "Entenda como funciona autenticação com JWT.",
            content:
                "JWT é amplamente utilizado em APIs modernas. Neste artigo vamos entender como funciona na prática.",
            coverImage: "https://picsum.photos/800/400?random=5",
            readTime: "8 min",
            categoryId: "07214b17-b561-4cd0-a45a-410c96374584",
            status: "PUBLISHED",
            authorId: "b0e58cbc-22a1-4fb5-b352-71e887c76b3f",
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "f6f6c6d7-6666-4f66-ffff-666666666666",
            slug: "docker-para-desenvolvedores",
            title: "Docker para desenvolvedores",
            excerpt: "Como usar Docker no seu dia a dia.",
            content:
                "Docker facilita o ambiente de desenvolvimento. Veja como criar containers e usar no seu projeto.",
            coverImage: "https://picsum.photos/800/400?random=6",
            readTime: "11 min",
            categoryId: "aa0c0b0e-5ad0-4e31-b37a-d7841bd0b874",
            status: "PUBLISHED",
            authorId: "b0e58cbc-22a1-4fb5-b352-71e887c76b3f",
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    for (const post of data) {
        // evita duplicar seed
        const exists = await db
            .select()
            .from(posts)
            .where(eq(posts.id, post.id));

        if (exists.length > 0) {
            console.log(`⏩ Post já existe: ${post.slug}`);
            continue;
        }

        await db.insert(posts).values(post);
        console.log(`✅ Criado: ${post.slug}`);
    }

    console.log("🌱 Seed finalizado!");
}

seed()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Erro no seed:", err);
        process.exit(1);
    });