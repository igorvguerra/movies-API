const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class MovieNotesController {
    async create(request, response) {
        const { title, description, movie_tags, rating } = request.body;
        const { user_id } = request.params;

        const [movie_note_id] = await knex("movie_notes").insert({
            title,
            description,
            user_id
        });

        const checkRating = await knex("rating");

        if(checkRating <= 0) {
            throw new AppError("Atribua uma nota entre 1 e 5")

        }if(checkRating >=6) {
            throw new AppError("Atribua uma nota entre 1 e 5")
        }else {
            await knex("rating").insert(ratingInsert);
        }
      

        const movie_tagsInsert = movie_tags.map(name => {
            return {
                movie_note_id,
                name,
                user_id
            }
        });

        await knex("movie_tags").insert(movie_tagsInsert);

        response.json();
    }

    async show(request, response) {
        const { id } = request.params;

        const movie_note = await knex("movie_notes").where({id}).first();
        const movie_tags = await knex("movie_tags").where({ movie_note_id : id }).orderBy("name");
        

        return response.json({
            ...movie_note,
            movie_tags,
            
        });
    }

    async delete(request, response) {
        const { id } = request.params;

        await knex("movie_notes").where({ id }).delete();

        return response.json();
    }

    async index(request, response) {
        const { title, user_id, movie_tags } = request.query;

        let movie_notes;

        if(movie_tags) {
            const filterTags = movie_tags.split(",").map(tag => tag.trim());

            movie_notes = await knex("movie_tags").select(["movie_notes.id", "movie_notes.title", "movie_notes.user_id"]).where("movie_notes.user_id", user_id).whereLike("movie_notes.title", `%${title}%`).whereIn("name", filterTags).innerJoin("movie_notes", "movie_notes.id", "movie_tags.note_id").orderBy("movie_notes.title");
        
        }else {
            movie_notes = await knex("movie_notes").where({ user_id }).whereLike("title", `%${title}%`).orderBy("title");
        }
       

        const userTags = await knex("movie_tags").where({ user_id });
        const notesWithTags = notes.map(note => {
            const noteTags = userTags.filter(tag => tag.note_id === note.id);

            return {
                ...note,
                tags: noteTags
            }
        });

        return response.json(notesWithTags);
    }

};

module.exports = MovieNotesController;