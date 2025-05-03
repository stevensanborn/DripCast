import { db } from "@/db";
import { categories } from "@/db/schema";

const categories_seeds = [
    {
        name: "Technology",
        description: "Technology category",
    },
    {
        name: "Science",
        description: "Science category",
    },
    {
        name: "Health",
        description: "Health category",
    },
    {
        name: "Business",
        description: "Business category",
    },
    {
        name: "Entertainment",
        description: "Entertainment category",
    },      
    {
        name: "Sports",
        description: "Sports category",
    },
    {
        name: "Politics",
        description: "Politics category",
    },
   
    {
        name: "Art",
        description: "Art category",
    },
    {
        name: "Music",
        description: "Music category",
    },
    {
        name: "Food",
        description: "Food category",
    },
    {
        name: "Travel",
        description: "Travel category",
    },
    {
        name: "Fashion",
        description: "Fashion category",
    },
    {
        name: "Education",
        description: "Education category",
    },
    {
        name: "Environment",
        description: "Environment category",
    },
    {
        name: "History",
        description: "History category",
    },
    {
        name: "News",
        description: "News category",
    },
    {
        name: "Gaming",
        description: "Gaming category",
    },
    {
        name: "Pets",
        description: "Pets category",
    },
   
    
    
    {
        name: "Lifestyle",
        description: "Lifestyle category",
    },
    {
        name: "Comedy",
        description: "Comedy category",
    },
    
]

async function seedCategories() {
    try {
        // for (const cat of categories_seeds) {
            await db.insert(categories).values(categories_seeds);
        // }
    } catch (error) {
        console.error("ERROR SEEDING CATEGORIES", error);
        process.exit(1);
    }
}

seedCategories();