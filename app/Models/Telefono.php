<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Telefono extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $table = "telefono";
    protected $fillable = ['persona_id', 'numero'];

    public function persona()
    {
        return $this->belongsTo(Persona::class);
    }

}

