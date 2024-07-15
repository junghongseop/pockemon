import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styled from "styled-components";

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Use useNavigate hook for navigation
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        );
        const speciesResponse = await axios.get(
          `https://pokeapi.co/api/v2/pokemon-species/${id}`
        );

        const koreanName = speciesResponse.data.names.find(
          (name) => name.language.name === "ko"
        );

        const abilities = await Promise.all(
          response.data.abilities.map(async (ability) => {
            const abilityResponse = await axios.get(ability.ability.url);
            const koreanAbilityName = abilityResponse.data.names.find(
              (name) => name.language.name === "ko"
            );
            return koreanAbilityName
              ? koreanAbilityName.name
              : ability.ability.name;
          })
        );

        const moves = await Promise.all(
          response.data.moves.map(async (move) => {
            const moveResponse = await axios.get(move.move.url);
            const koreanMoveName = moveResponse.data.names.find(
              (name) => name.language.name === "ko"
            );
            return koreanMoveName ? koreanMoveName.name : move.move.name;
          })
        );

        const types = await Promise.all(
          response.data.types.map(async (type) => {
            const typeResponse = await axios.get(type.type.url);
            const koreanTypeName = typeResponse.data.names.find(
              (name) => name.language.name === "ko"
            );
            return koreanTypeName ? koreanTypeName.name : type.type.name;
          })
        );

        setPokemon({
          ...response.data,
          korean_name: koreanName.name,
          abilities,
          moves,
          types,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!pokemon) {
    return <div>Pokemon not found</div>;
  }

  return (
    <PokemonDetailStyle>
      <BackButton onClick={goBack}>돌아가기</BackButton>
      <h1>
        No.{pokemon.id} - {pokemon.korean_name}
      </h1>
      <PokemonImage
        src={pokemon.sprites.front_default}
        alt={pokemon.korean_name}
      />
      <Container>
        몸무게: {pokemon.height}, 키: {pokemon.weight}
        <br />
        속성: {pokemon.types.join(", ")}
        <br />
        특성: {pokemon.abilities.join(", ")}
        <br />
        <TextBox>기술: {pokemon.moves.join(", ")}</TextBox>
      </Container>
      <FixedButton onClick={() => alert("Button clicked!")}>
        <BallStyle src="https://svgsilh.com/svg_v2/1574006.svg" />
      </FixedButton>
    </PokemonDetailStyle>
  );
};

export default PokemonDetail;

const Container = styled.div`
  width: 40%;
  height: auto;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  font-family: "DungGeunMo", sans-serif;
  font-size: 15px;
  text-align: center;
  line-height: 30px;
  flex-direction: column;
`;

const PokemonDetailStyle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 5%;
  width: 100%;
  height: 120vh;
  background-color: white;
  background-size: cover;
  font-family: "DungGeunMo", sans-serif;
  padding-bottom: 5%;
`;

const PokemonImage = styled.img`
  width: 300px;
  height: 300px;
`;

const TextBox = styled.div`
  display: inline-block;
  width: 80%;
  flex-direction: column;
`;

const FixedButton = styled.button`
  position: fixed;
  bottom: 10px;
  right: 10px;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  background: none;
`;

const BallStyle = styled.img`
  width: 100px;
  height: 100px;
  transition: all 0.3s ease;

  &:hover {
    content: url('https://i.namu.wiki/i/bTca2nNtVRjrLf08CrKv8fvVluVKWOjv-V3xyFEtvkKDs_yEP0h5nnjr_OYDax80NhKM8kriNO73DU6YDgRHMA.webp');
    transform: scale(1.1);
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  background-color: white;
  color: black;
  font-size: 16px;
  border-radius: 5px;

  &:hover {
    background-color: #f5f5f5;
  }
`;

